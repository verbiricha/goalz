interface Section {
  name: string;
  letters: string;
  value: Record<string, any>;
}

interface DecodedLightningInvoice {
  paymentRequest: string;
  sections: Section;
}

declare module "light-bolt11-decoder" {
  decode: (pr: string) => DecodedLightningInvoice;
}
