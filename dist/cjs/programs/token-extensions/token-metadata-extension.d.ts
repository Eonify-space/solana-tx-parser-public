export declare const metadataLayout: import("@solana/codecs").VariableSizeCodec<
	{
		instruction: Uint8Array | import("@solana/codecs").ReadonlyUint8Array;
		symbol: any;
		name: any;
		uri: any;
		additionalMetadata: any[];
	},
	{
		instruction: import("@solana/codecs").ReadonlyUint8Array;
		symbol: any;
		name: any;
		uri: any;
		additionalMetadata: any[];
	} & {
		instruction: Uint8Array | import("@solana/codecs").ReadonlyUint8Array;
		symbol: any;
		name: any;
		uri: any;
		additionalMetadata: any[];
	}
>;
export declare const updateMetadataLayout: import("@solana/codecs").VariableSizeCodec<
	{
		instruction: Uint8Array | import("@solana/codecs").ReadonlyUint8Array;
		value: any;
		field:
			| (object & {
					__kind: "Name";
			  })
			| (object & {
					__kind: "Uri";
			  })
			| (object & {
					__kind: "Symbol";
			  })
			| ({
					value: any;
			  } & {
					__kind: "Key";
			  });
	},
	{
		instruction: import("@solana/codecs").ReadonlyUint8Array;
		value: any;
		field:
			| (object & {
					__kind: "Name";
			  } & {
					__kind: "Name";
			  })
			| (object & {
					__kind: "Uri";
			  } & {
					__kind: "Uri";
			  })
			| (object & {
					__kind: "Symbol";
			  } & {
					__kind: "Symbol";
			  })
			| ({
					value: any;
			  } & {
					value: any;
			  } & {
					__kind: "Key";
			  } & {
					__kind: "Key";
			  });
	} & {
		instruction: Uint8Array | import("@solana/codecs").ReadonlyUint8Array;
		value: any;
		field:
			| (object & {
					__kind: "Name";
			  })
			| (object & {
					__kind: "Uri";
			  })
			| (object & {
					__kind: "Symbol";
			  })
			| ({
					value: any;
			  } & {
					__kind: "Key";
			  });
	}
>;
export declare const removeKeyLayout: import("@solana/codecs").FixedSizeCodec<
	{
		idempotent: boolean;
		key: any;
	},
	{
		idempotent: boolean;
		key: any;
	} & {
		idempotent: boolean;
		key: any;
	}
>;
export declare const updateAuthorityLayout: import("@solana/codecs").VariableSizeCodec<
	{
		newAuthority: Uint8Array | import("@solana/codecs").ReadonlyUint8Array;
	},
	{
		newAuthority: import("@solana/codecs").ReadonlyUint8Array;
	} & {
		newAuthority: Uint8Array | import("@solana/codecs").ReadonlyUint8Array;
	}
>;
export declare const emitLayout: import("@solana/codecs").VariableSizeCodec<
	{
		start: import("@solana/codecs").OptionOrNullable<number | bigint>;
		end: import("@solana/codecs").OptionOrNullable<number | bigint>;
	},
	{
		start: import("@solana/codecs").Option<bigint>;
		end: import("@solana/codecs").Option<bigint>;
	} & {
		start: import("@solana/codecs").OptionOrNullable<number | bigint>;
		end: import("@solana/codecs").OptionOrNullable<number | bigint>;
	}
>;
//# sourceMappingURL=token-metadata-extension.d.ts.map
