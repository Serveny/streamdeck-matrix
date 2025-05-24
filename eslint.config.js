import { config } from "@elgato/eslint-config";
import { defineConfig, globalIgnores } from "eslint/config";

export default defineConfig([
	{
		extends: [config.recommended],
		rules: {
			"jsdoc/require-jsdoc": "off",
		},
	},
	globalIgnores(["**/bin/**/*"], "Ignore plugin bin directory"),
]);
