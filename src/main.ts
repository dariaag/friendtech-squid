import { TypeormDatabase } from "@subsquid/typeorm-store";
import { processor } from "./processor";
import * as friendTech from "./abi/FriendTechShares";
import { OwnershipTransferred, Trade } from "./model";
processor.run(new TypeormDatabase({ supportHotBlocks: true }), async (ctx) => {
  const trades: Trade[] = [];
  const ownershipTransfers: OwnershipTransferred[] = [];
  for (let block of ctx.blocks) {
    for (let log of block.logs) {
      // decode and normalize the tx data
      if (log.topics[0] === friendTech.events.Trade.topic) {
        let event = friendTech.events.Trade.decode(log);
        let trade = new Trade({
          id: log.transaction?.hash,
          trader: event.trader,
          subject: event.subject,
          isBuy: event.isBuy,
          shareAmount: event.shareAmount,
          ethAmount: event.ethAmount,
          protocolEthAmount: event.protocolEthAmount,
          subjectEthAmount: event.subjectEthAmount,
          supply: event.supply,
          blockNumber: BigInt(block.header.height),
          blockTimestamp: BigInt(block.header.timestamp),
          transactionHash: log.transaction?.hash,
        });
        trades.push(trade);
        ctx.log.info(
          `Trade event detected at : ${trade.id},'\n' trader: ${trade.trader}, '\n' subject: ${trade.subject},'\n' isBuy: ${trade.isBuy}, shareAmount: ${trade.shareAmount},'\n' ethAmount: ${trade.ethAmount}, protocolEthAmount: ${trade.protocolEthAmount},'\n' subjectEthAmount: ${trade.subjectEthAmount}, supply: ${trade.supply}`
        );
      }
      if (log.topics[0] === friendTech.events.OwnershipTransferred.topic) {
        let event = friendTech.events.OwnershipTransferred.decode(log);
        let ownershipTransferred = new OwnershipTransferred({
          id: log.transaction?.hash,
          previousOwner: event.previousOwner,
          newOwner: event.newOwner,
          transactionHash: log.transaction?.hash,
          blockNumber: BigInt(block.header.height),
          blockTimestamp: BigInt(block.header.timestamp),
        });
        ownershipTransfers.push(ownershipTransferred);
        ctx.log.info(
          `OwnershipTransferred event detected at : ${ownershipTransferred.id}, '\n' previousOwner: ${ownershipTransferred.previousOwner}, '\n' newOwner: ${ownershipTransferred.newOwner}`
        );
      }
    }
  }

  await ctx.store.upsert(trades);
  await ctx.store.upsert(ownershipTransfers);
});
