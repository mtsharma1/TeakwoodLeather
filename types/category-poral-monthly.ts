interface Address {
  Name?: string;
  Line1: string;
  Line2: string;
  City?: string;
  State?: string;
  Country?: string;
  Pincode?: string;
  Phone?: string;
}

// Type definitions for tax structure
interface Tax {
  SalesLedger: string;
  CGST: number;
  CGSTRate: string;
  SGST: number;
  SGSTRate: string;
  IGST: number;
  IGSTRate: string;
  UTGST: number;
  UTGSTRate: string;
  CESS: number;
  CESSRate: string;
}

// Type definitions for other charges
interface OtherCharges {
  ShippingCharges: number;
  CODCharges: number;
}

// Type definitions for other taxes
interface OtherTaxes {
  GiftWrapCharges: number;
  TaxOnOtherCharges: number;
}

// Main sales record interface
export interface SalesRecord {
  Date: string;
  SaleOrderNumber: string;
  InvoiceNumber: string;
  ChannelEntry: string;
  "Channel Ledger": string;
  ProductName: string;
  ProductSKUCode: string;
  "Product Name": string;
  Qty: number;
  UnitPrice: number;
  Currency: string;
  ConversionRate: number;
  Total: number;
  CustomerName: string;
  ShippingAddress: Address;
  ShippingProvider: string;
  AWBNumber: string;
  Sales: number;
  Tax: Tax;
  OtherCharges: OtherCharges;
  Godown: string;
  DispatchDate: string;
  Narration: string;
  Entity: string;
  OriginalInvoiceDate: string;
  ChannelInvoiceCreated: string;
  CustomerGSTIN: string;
  GSTRegistrationType: string;
  TCSAmount: number;
  OtherTaxes: OtherTaxes;
  HSNCode: string;
  PaymentMethod: string;
  BillingAddress: {
    Line1: string;
    Line2: string;
  };
}

export interface ProductQuantity { [key: string]: string }
