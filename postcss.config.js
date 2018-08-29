module.exports = {
	plugins: [
		require('postcss-import')({
			plugins: [
				require('stylelint')({})
			]
		}),
		require('postcss-nested'),
		require('postcss-for'),
		require('postcss-cssnext')({
			browsers: ['ie 8'],
			features: {
				autoprefixer: false
			}
		}),
		require('postcss-reporter')({ clearReportedMessages: true })
	]
}