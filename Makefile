publish:
	npm publish

publish-sync: publish
	cnpm sync dora-plugin-livereload
	tnpm sync dora-plugin-livereload
