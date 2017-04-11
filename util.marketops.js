class marketOp {
    /**
     * Checks for a Market Opportunity to Buy/Sell from Market at reasonable E costs
     *   Basically converts E to Credits via Market Arbitrage
     * @param {string}  ResourceCode    one of RESOURCE_*
     * @param {number}  EnergyValue     max EnergyCostPer to consider for a Trade
     * @param {Boolean} [ExecTrx=false] true=Execute the Trade; fales=Display only
     */
    list = (ResourceCode, EnergyValue, ExecTrx = false) => {
        if (ResourceCode != null) {
            allSellOrders = Game.market.getAllOrders({type: ORDER_SELL, resourceType: ResourceCode});
            allBuyOrders = Game.market.getAllOrders({type: ORDER_BUY, resourceType: ResourceCode});
        } else {
            allSellOrders = Game.market.getAllOrders({type: ORDER_SELL});
            allBuyOrders = Game.market.getAllOrders({type: ORDER_BUY});
        }
        let allBuySort = _.sortBy(allBuyOrders, 'price');
        let allSellSort = _.sortBy(allSellOrders, 'price');
        Best = {
            b: 0,
            s: 0,
            EnergyCostPer: Infinity,
            CreditsEarned: 0
        };
        let madeOrder = false;
        for (let b = 0; b < allBuySort.length && !madeOrder; b++) {
            for (let s = 0; s < allSellSort.length && !madeOrder; s++) {
                if (allBuySort[b].price > allSellSort[s].price && allBuySort[b].resourceType == allSellSort[s].resourceType) {
                    //trxAmount = Math.min(allBuySort[b].remainingAmount, allSellSort[s].remainingAmount);
                    trxAmount = Math.min(Math.floor((Game.market.credits / 2) / allSellSort[s].price), allBuySort[b].remainingAmount, allSellSort[s].remainingAmount);
                    buyTrxCost = _.round(Game.market.calcTransactionCost(trxAmount, 'W3S96', allBuySort[b].roomName), 2);
                    sellTrxCost = Game.market.calcTransactionCost(trxAmount, 'W3S96', allSellSort[s].roomName);
                    TotalTrxCost = buyTrxCost + sellTrxCost;
                    CreditsEarned = _.round((allBuySort[b].price - allSellSort[s].price) * trxAmount, 2);
                    EnergyCostPer = _.round(TotalTrxCost / CreditsEarned, 2);
                    if (EnergyCostPer < Best.EnergyCostPer || CreditsEarned > Best.CreditsEarned) {
                        Best.b = b;
                        Best.s = s;
                        Best.trxAmount = trxAmount;
                        Best.buyTrxCost = buyTrxCost;
                        Best.sellTrxCost = sellTrxCost;
                        Best.TotalTrxCost = TotalTrxCost;
                        Best.CreditsEarned = CreditsEarned;
                        Best.EnergyCostPer = EnergyCostPer;
                    }
                    if (EnergyCostPer < EnergyValue || allBuySort[b].resourceType == "E") {
                        console.log(`${allBuySort[b].resourceType} Buy[${b}]@${allBuySort[b].price} to Sell[${s}]@${allSellSort[s].price} TrxEnergy=${TotalTrxCost}(${buyTrxCost}+${sellTrxCost}) Credits=${CreditsEarned} E/C=${EnergyCostPer}`);
                        console.log(`--   Game.market.deal("${allSellSort[s].id}", ${trxAmount}, "W3S96"); Game.market.deal("${allBuySort[b].id}", ${trxAmount}, "W3S96");`);
                        if (ExecTrx) {
                            ExecPart1 = Game.market.deal(allSellSort[s].id, trxAmount, "W3S96");
                            if (ExecPart1 != 0) {
                                console.log(`ExecPart1=${ExecPart1}: ${translateErrorCode(ExecPart1)}`);
                            } else {
                                // ExecPart2 = Game.market.deal(allBuySort[b].id, trxAmount, allBuySort[b].roomName);
                                cmd1 = `Memory.ExecPart2 = Game.market.deal("${allBuySort[b].id}", ${trxAmount}, "W3S96");`;
                                cmd1 += "console.log('ExecPart2=|'+ExecPart2+'|: |'+translateErrorCode(ExecPart2)+'|');";
                                let idx = FutureCmd(Game.time + 1, cmd1);
                                cmd2 = `xProfit=Game.market.credits-${Game.market.credits};` + ` if (Memory.FutureTurn[${idx}].ExecPart2 === 0 && xProfit > 0) ` + `{console.log(" Good Trade PROFIT="+xProfit);} ` + `else {console.log(" **BAD** Trade PROFIT="+xProfit+"Error=|Memory.FutureTurn[${idx}].ExecPart2|");}`;
                                FutureCmd(Game.time + 2, cmd2);
                                madeOrder = true;
                            }
                        }
                        console.log('--');
                    }
                }
            }
        }
        console.log('Total Orders in queues:', allSellOrders.length, allBuyOrders.length);
        if (Best.EnergyCostPer < Infinity) {
            console.log(`*BEST* ${allBuySort[Best.b].resourceType} Buy[${Best.b}]@${allBuySort[Best.b].price} to Sell[${Best.s}]@${allSellSort[Best.s].price} TrxEnergy=${Best.TotalTrxCost}(${Best.buyTrxCost}+${Best.sellTrxCost}) Credits=${Best.CreditsEarned} E/C=${Best.EnergyCostPer}`);
            console.log(`--   Game.market.deal("${allSellSort[Best.s].id}", ${Best.trxAmount}, "W3S96"); Game.market.deal("${allBuySort[Best.b].id}", ${Best.trxAmount}, "W3S96");`);
        }
    }
}
