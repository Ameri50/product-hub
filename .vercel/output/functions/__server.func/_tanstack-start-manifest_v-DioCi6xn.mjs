//#region node_modules/.nitro/vite/services/ssr/assets/_tanstack-start-manifest_v-DioCi6xn.js
var tsrStartManifest = () => ({ routes: {
	__root__: {
		filePath: "/Users/moisesrojas/Documents/proyectotesis/product-hub/src/routes/__root.tsx",
		children: ["/", "/catalogo"],
		preloads: ["/assets/index-DUWj-KhA.js", "/assets/jsx-runtime-Bc41UEzt.js"],
		scripts: [{ attrs: {
			type: "module",
			async: !0,
			src: "/assets/index-DUWj-KhA.js"
		} }]
	},
	"/": {
		filePath: "/Users/moisesrojas/Documents/proyectotesis/product-hub/src/routes/index.tsx",
		children: void 0,
		preloads: [
			"/assets/routes-NmcLOEjB.js",
			"/assets/loader-circle-DxGG19br.js",
			"/assets/auth-context-CT2TNnFz.js"
		]
	},
	"/catalogo": {
		filePath: "/Users/moisesrojas/Documents/proyectotesis/product-hub/src/routes/catalogo.tsx",
		children: ["/catalogo/$productId"],
		preloads: [
			"/assets/catalogo-62uFI3B7.js",
			"/assets/loader-circle-DxGG19br.js",
			"/assets/ProductForm-Cl7L9-FU.js"
		]
	},
	"/catalogo/$productId": {
		filePath: "/Users/moisesrojas/Documents/proyectotesis/product-hub/src/routes/catalogo.$productId.tsx",
		children: void 0,
		preloads: ["/assets/catalogo._productId-CgzZ-M6m.js"]
	}
} });
//#endregion
export { tsrStartManifest };
