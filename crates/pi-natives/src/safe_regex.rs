use std::{
	collections::VecDeque,
	sync::{LazyLock, Mutex},
};

use napi::{Error, Result};
use napi_derive::napi;
use regex::{Regex, RegexBuilder};

const MAX_PATTERN_BYTES: usize = 4096;
const MAX_CACHE_ENTRIES: usize = 64;
const COMPILED_SIZE_LIMIT: usize = 2 * 1024 * 1024;
const DFA_SIZE_LIMIT: usize = 2 * 1024 * 1024;

static CACHE: LazyLock<Mutex<VecDeque<(String, Regex)>>> =
	LazyLock::new(|| Mutex::new(VecDeque::with_capacity(MAX_CACHE_ENTRIES)));

fn compile(pattern: &str) -> Result<Regex> {
	if pattern.len() > MAX_PATTERN_BYTES {
		return Err(Error::from_reason(format!(
			"Regex pattern exceeds the {MAX_PATTERN_BYTES}-byte safety limit"
		)));
	}
	let cached = {
		let cache = CACHE
			.lock()
			.map_err(|_| Error::from_reason("Linear regex cache lock is poisoned"))?;
		cache
			.iter()
			.find_map(|(cached, regex)| (cached == pattern).then(|| regex.clone()))
	};
	if let Some(regex) = cached {
		return Ok(regex);
	}

	let regex = RegexBuilder::new(pattern)
		.size_limit(COMPILED_SIZE_LIMIT)
		.dfa_size_limit(DFA_SIZE_LIMIT)
		.build()
		.map_err(|error| Error::from_reason(format!("Invalid linear regex: {error}")))?;
	let mut cache = CACHE
		.lock()
		.map_err(|_| Error::from_reason("Linear regex cache lock is poisoned"))?;
	if cache.len() == MAX_CACHE_ENTRIES {
		cache.pop_front();
	}
	cache.push_back((pattern.to_owned(), regex.clone()));
	Ok(regex)
}

/// Find the first match with Rust's guaranteed-linear-time regex engine.
///
/// Backreferences and look-around are intentionally rejected because they
/// cannot be evaluated with the engine's linear-time guarantee.
#[napi(js_name = "linearRegexFind")]
pub fn linear_regex_find(pattern: String, text: String) -> Result<Option<String>> {
	let regex = compile(&pattern)?;
	Ok(regex.find(&text).map(|found| found.as_str().to_owned()))
}

#[cfg(test)]
mod tests {
	use super::linear_regex_find;

	#[test]
	fn finds_alternation_without_backtracking() {
		assert_eq!(
			linear_regex_find("ready|listening".into(), "service is listening on 8080".into())
				.unwrap(),
			Some("listening".into())
		);
	}

	#[test]
	fn rejects_backtracking_only_features() {
		let error = linear_regex_find("(ready)\\1".into(), "readyready".into()).unwrap_err();
		assert!(
			error
				.to_string()
				.contains("backreferences are not supported")
		);
	}

	#[test]
	fn preserves_empty_matches() {
		assert_eq!(linear_regex_find("^".into(), "ready".into()).unwrap(), Some(String::new()));
	}
}
