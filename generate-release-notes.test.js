const {getOctokit, context} = require('@actions/github');
const core = require('@actions/core');

const stripIndent = require('strip-indent');
const {generateReleaseNotes} = require('./generate-release-notes');

const dedent = string => stripIndent(string).trim();
const range = 'v3.0.0..v3.1.0';

const {owner, repo} = context.repo;
const octokit = getOctokit(core.getInput('token'));

test('generates changelog using default options', async () => {
	const output = await generateReleaseNotes({range});

	expect(output).toEqual(dedent(`
		- f9cec2b2 Add support for \`exclude: true\` (#23)
		- 8d79eb1a Meta: Add tests using jest (#22)
		- 71ec95ec Meta: update self workflow (#16)
		- a74ce6a1 Meta: Document how to add changelogs to old tags (#15)
		- bfe14281 Bump @actions/core from 1.2.4 to 1.2.6 (#19)
		- a6eb5131 Readme: make first example bare-bones (#18)
		- 850de175 Meta: Update readme example to v3

		[\`v3.0.0..v3.1.0\`](https://github.com/fregante/release-with-changelog/compare/v3.0.0..v3.1.0)
	`));
});

test('generates changelog with custom release template', async () => {
	const output = await generateReleaseNotes({
		range,
		releaseTemplate: dedent(`
			### Changelog

			{commits}

			❤
		`)
	});

	expect(output).toEqual(dedent(`
		### Changelog

		- f9cec2b2 Add support for \`exclude: true\` (#23)
		- 8d79eb1a Meta: Add tests using jest (#22)
		- 71ec95ec Meta: update self workflow (#16)
		- a74ce6a1 Meta: Document how to add changelogs to old tags (#15)
		- bfe14281 Bump @actions/core from 1.2.4 to 1.2.6 (#19)
		- a6eb5131 Readme: make first example bare-bones (#18)
		- 850de175 Meta: Update readme example to v3

		❤
	`));
});

test('generates changelog with custom commit template', async () => {
	const output = await generateReleaseNotes({
		range,
		commitTemplate: '- {title}',
		releaseTemplate: '{commits}'
	});

	expect(output).toEqual(dedent(`
		- Add support for \`exclude: true\` (#23)
		- Meta: Add tests using jest (#22)
		- Meta: update self workflow (#16)
		- Meta: Document how to add changelogs to old tags (#15)
		- Bump @actions/core from 1.2.4 to 1.2.6 (#19)
		- Readme: make first example bare-bones (#18)
		- Meta: Update readme example to v3
	`));
});

test('generates changelog with custom exclude', async () => {
	const output = await generateReleaseNotes({
		range,
		commitTemplate: '- {title}',
		releaseTemplate: '{commits}',
		exclude: '^Meta|^Lint|^Refactor'
	});

	expect(output).toEqual(dedent(`
		- Add support for \`exclude: true\` (#23)
		- Bump @actions/core from 1.2.4 to 1.2.6 (#19)
		- Readme: make first example bare-bones (#18)
	`));
});

test('generates changelog with exclude preset', async () => {
	const output = await generateReleaseNotes({
		range,
		commitTemplate: '- {title}',
		releaseTemplate: '{commits}',
		exclude: 'true'
	});

	expect(output).toEqual(dedent(`
		- Add support for \`exclude: true\` (#23)
	`));
});

test('generates changelog with date presets', async () => {
	const output = await generateReleaseNotes({
		range,
		commitTemplate: '- {date} {title}',
		releaseTemplate: '{commits}'
	});

	expect(output).toEqual(dedent(`
		- 2020-10-21 Add support for \`exclude: true\` (#23)
		- 2020-10-20 Meta: Add tests using jest (#22)
		- 2020-10-02 Meta: update self workflow (#16)
		- 2020-10-02 Meta: Document how to add changelogs to old tags (#15)
		- 2020-10-02 Bump @actions/core from 1.2.4 to 1.2.6 (#19)
		- 2020-09-22 Readme: make first example bare-bones (#18)
		- 2020-09-18 Meta: Update readme example to v3
	`));
});

test('generates changelog with custom date presets', async () => {
	const output = await generateReleaseNotes({
		range,
		commitTemplate: '- {date} {title}',
		releaseTemplate: '{commits}',
		dateFormat: '%d.%m.%Y'
	});

	expect(output).toEqual(dedent(`
		- 21.10.2020 Add support for \`exclude: true\` (#23)
		- 20.10.2020 Meta: Add tests using jest (#22)
		- 02.10.2020 Meta: update self workflow (#16)
		- 02.10.2020 Meta: Document how to add changelogs to old tags (#15)
		- 02.10.2020 Bump @actions/core from 1.2.4 to 1.2.6 (#19)
		- 22.09.2020 Readme: make first example bare-bones (#18)
		- 18.09.2020 Meta: Update readme example to v3
	`));
});

test('ensure that replacements aren’t applied in commit titles', async () => {
	const output = await generateReleaseNotes({
		range: 'v3.1.0..v3.2.0'
	});

	expect(output).toEqual(expect.stringContaining('{date}'));
});

test('generates changelog using reverse optios', async () => {
	const output = await generateReleaseNotes({
		range,
		sort: 'asc'
	});

	expect(output).toEqual(dedent(`
		- 850de175 Meta: Update readme example to v3
		- a6eb5131 Readme: make first example bare-bones (#18)
		- bfe14281 Bump @actions/core from 1.2.4 to 1.2.6 (#19)
		- a74ce6a1 Meta: Document how to add changelogs to old tags (#15)
		- 71ec95ec Meta: update self workflow (#16)
		- 8d79eb1a Meta: Add tests using jest (#22)
		- f9cec2b2 Add support for \`exclude: true\` (#23)

		[\`v3.0.0..v3.1.0\`](https://github.com/fregante/release-with-changelog/compare/v3.0.0..v3.1.0)
	`));
});

test('generates changelog using author replacement', async () => {
	const output = await generateReleaseNotes({
		octokit,
		owner,
		repo,
		range,
		commitTemplate: '- {author} > {title}'
	});

	expect(output).toEqual(dedent(`
		- @fregante > Add support for \`exclude: true\` (#23)
		- @notlmn > Meta: Add tests using jest (#22)
		- @fregante > Meta: update self workflow (#16)
		- @fregante > Meta: Document how to add changelogs to old tags (#15)
		- @dependabot[bot] > Bump @actions/core from 1.2.4 to 1.2.6 (#19)
		- @fregante > Readme: make first example bare-bones (#18)
		- @notlmn > Meta: Update readme example to v3

		[\`v3.0.0..v3.1.0\`](https://github.com/fregante/release-with-changelog/compare/v3.0.0..v3.1.0)
	`));
});
