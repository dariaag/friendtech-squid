import { lookupArchive } from "@subsquid/archive-registry";
import {
  BlockHeader,
  DataHandlerContext,
  EvmBatchProcessor,
  EvmBatchProcessorFields,
  Log as _Log,
  Transaction as _Transaction,
} from "@subsquid/evm-processor";
import * as friendTech from "./abi/FriendTechShares";
export const processor = new EvmBatchProcessor()
  .setDataSource({
    archive: lookupArchive("base-mainnet"),

    chain: "https://mainnet.base.org",
  })
  .setFinalityConfirmation(75)
  .setFields({
    log: {
      topics: true,
      data: true,
    },
  })
  .setBlockRange({
    from: 2430440,
  })
  .addLog({
    address: ["0xCF205808Ed36593aa40a44F10c7f7C2F67d4A4d4"],
    topic0: [
      friendTech.events.OwnershipTransferred.topic,
      friendTech.events.Trade.topic,
    ],
    transaction: true,
  });

//   .addTransaction({
//     to: ["0xCF205808Ed36593aa40a44F10c7f7C2F67d4A4d4"],
//   });

export type Fields = EvmBatchProcessorFields<typeof processor>;
export type Block = BlockHeader<Fields>;
export type Log = _Log<Fields>;
export type Transaction = _Transaction<Fields>;
export type ProcessorContext<Store> = DataHandlerContext<Store, Fields>;
