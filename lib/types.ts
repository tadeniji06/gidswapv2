export type Currency = {
  id: string;
  name: string;
  symbol: string;
  logo: string;
  rate?: number;
  coingeckoId: string   
  type: "crypto" | "fiat";
};


export interface SwapFormProps {
  sendAmount: string;
  setSendAmount: (value: string) => void;
  sendCurrency: Currency | null;
  setSendCurrency: (currency: Currency) => void;
  receiveAmount: string;
  setReceiveAmount: (value: string) => void;
  receiveCurrency: Currency | null;
  setReceiveCurrency: (currency: Currency) => void;
  setShowModal: (value: boolean) => void;
  tab: string;
}
