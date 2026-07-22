//#region node_modules/.nitro/vite/services/ssr/assets/_tanstack-start-manifest_v-BGwdYQFW.js
var tsrStartManifest = () => ({ routes: {
	__root__: {
		filePath: "/Users/moisesrojas/Documents/proyectotesis/product-hub/src/routes/__root.tsx",
		children: ["/", "/catalogo"],
		preloads: ["/assets/index-BWNnbO_F.js", "/assets/jsx-runtime-Bc41UEzt.js"],
		scripts: [{ attrs: {
			type: "module",
			async: !0,
			src: "/assets/index-BWNnbO_F.js"
		} }]
	},
	"/": {
		filePath: "/Users/moisesrojas/Documents/proyectotesis/product-hub/src/routes/index.tsx",
		children: void 0,
		preloads: [
			"/assets/routes-DTQHGUYJ.js",
			"/assets/loader-circle-DxGG19br.js",
			"/assets/auth-context-CT2TNnFz.js"
		]
	},
	"/catalogo": {
		filePath: "/Users/moisesrojas/Documents/proyectotesis/product-hub/src/routes/catalogo.tsx",
		children: ["/catalogo/$productId"],
		preloads: [
			"/assets/catalogo-8YN-m8OM.js",
			"/assets/loader-circle-DxGG19br.js",
			"/assets/ProductForm-Cl7L9-FU.js"
		]
	},
	"/catalogo/$productId": {
		filePath: "/Users/moisesrojas/Documents/proyectotesis/product-hub/src/routes/catalogo.$productId.tsx",
		children: void 0,
		preloads: ["/assets/catalogo._productId-aLHzWg4J.js"]
	}
} });
//#endregion
export { tsrStartManifest };
