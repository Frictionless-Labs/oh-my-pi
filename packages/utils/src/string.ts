/** Remove every trailing occurrence of one UTF-16 code unit in linear time. */
export function stripTrailingCharacter(value: string, character: string): string {
	if (character.length !== 1) throw new Error("character must be a single UTF-16 code unit");
	let end = value.length;
	while (end > 0 && value[end - 1] === character) end -= 1;
	return end === value.length ? value : value.slice(0, end);
}

/** Remove trailing ASCII spaces and tabs without consuming line endings. */
export function trimTrailingHorizontalWhitespace(value: string): string {
	let end = value.length;
	while (end > 0) {
		const code = value.charCodeAt(end - 1);
		if (code !== 0x20 && code !== 0x09) break;
		end -= 1;
	}
	return end === value.length ? value : value.slice(0, end);
}
