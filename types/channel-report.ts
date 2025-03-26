export interface PivotTableData {
   channelName: string;
   uniformSkuCode: string;
   count: number;
}

export interface ChannelCounts {
   [channelName: string]: {
       [skuCode: string]: number;
   };
}