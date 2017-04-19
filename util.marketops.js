//class marketOp {
module.exports = {

    init() {
        if (Memory.market === undefined) { // define Memory.market on first use.
            Memory.market = {
                Ctx: []
            };
            // Memory.market.Ctx[0] = {
            //     open: false,
            //     sellId: null
            // };
            Memory.market.autoFind = {
                resource: null,
                minValue: 80,
                skipTicks: 2
            }
        }
    },
    /**
     * Checks for a Market Opportunity to Buy/Sell from Market at reasonable E costs
     *   Basically converts E to Credits via Market Arbitrage
     * @param  {string}  ResourceParam   one of RESOURCE_*
     * @param  {number}  EnergyValue     max EnergyCostPer to consider for a Trade
     * @param  {Boolean} [ExecTrx=false] true=Execute the Trade; fales=return only
     * @param  {Boolean} [Display=true]  Display the found trade Ops
     * @return {Object}                  Best trade Op
     */
    find(ResourceParam, EnergyValue, ExecTrx = false, Display = true) {
        let maxBuyByType = Util.MarketOp.mBTinit(ResourceParam, 0);
        let minSellByType = Util.MarketOp.mBTinit(ResourceParam, Infinity);
        // Iterate through each ResourceType or just one that was Param1
        Best = {
            EnergyCostPer: Infinity,
            CreditsEarned: 0
        };
        let cpuDelta = 0;
        let cpuB4 = 0;
        let cpuB4s = 0;
        let totalCalcTrx = 0;
        let skipRoom = 0;
        // let allBuySort = [];
        // let allSellSort = [];
        for (let resourceCode in minSellByType) {
            allSellSort = Game.market.getAllOrders({type: ORDER_SELL, resourceType: resourceCode});
            allBuySort = Game.market.getAllOrders({type: ORDER_BUY, resourceType: resourceCode});
            if (Display) {
                // Sort gives better view but slower
                allSellSort = _.sortBy(allSellSort, 'price');
                allBuySort = _.sortBy(allBuySort, 'price');
            }
            //cpuB4 = Game.cpu.getUsed();
            for (let b = 0; b < allBuySort.length; b++) {
                //typeof maxBuyByType[allBuySort[b].resourceType] === "undefined" ||
                if (maxBuyByType[allBuySort[b].resourceType] < allBuySort[b].price) {
                    maxBuyByType[allBuySort[b].resourceType] = allBuySort[b].price;
                }
            }
            //cpuDelta = Game.cpu.getUsed() - cpuB4;
            // console.log(`maxBuyByType  time=${cpuDelta.toFixed(3)}`);
            //cpuB4 = Game.cpu.getUsed();
            let calcTrx = 0;
            for (let s = 0; s < allSellSort.length; s++) {
                //typeof minSellByType[allSellSort[s].resourceType] === "undefined" ||
                if (minSellByType[allSellSort[s].resourceType] > allSellSort[s].price) {
                    minSellByType[allSellSort[s].resourceType] = allSellSort[s].price;
                }
            }
            //cpuDelta = Game.cpu.getUsed() - cpuB4;
            //console.log(`minSellByType time=${cpuDelta.toFixed(3)}`);
            cpuB4 = Game.cpu.getUsed();
            for (let b = 0; b < allBuySort.length; b++) {
                // if (allBuySort[b].roomName === 'W3S96') {
                //     continue;
                // }
                if (allBuySort[b].price <= minSellByType[allBuySort[b].resourceType]) {
                    //console.log(`Buy **skip** ${b} ${allBuySort[b].resourceType} ${allBuySort[b].price}>${minSellByType[allBuySort[b].resourceType]}`);
                    continue;
                }
                //console.log(`Buy loop ${b} ${allBuySort[b].resourceType} $${allBuySort[b].price}>${minSellByType[allBuySort[b].resourceType]} |${(allBuySort[b].price > minSellByType[allBuySort[b].resourceType])}|`);
                for (let s = 0; s < allSellSort.length; s++) {
                    // if (allSellSort[s].roomName === 'W3S96') {
                    //     continue;
                    // }
                    if (allSellSort[s].price >= maxBuyByType[allSellSort[s].resourceType]) {
                        //console.log(`  Sell **skip** ${s} ${allSellSort[s].resourceType} ${allSellSort[s].price}>${maxBuyByType[allSellSort[s].resourceType]}`);
                        continue;
                    }
                    //console.log(`  Sell loop ${s} ${allSellSort[s].resourceType} $${allSellSort[s].price}`);
                    //console.log(`    max/min good ${b}/${allBuySort[b].resourceType}/${allSellSort[s].price} & ${s}/${allSellSort[s].resourceType}/${allSellSort[s].price} `);
                    if (allBuySort[b].price > allSellSort[s].price && allBuySort[b].resourceType == allSellSort[s].resourceType) {
                        //console.log(`    match to calcTrx ${b} & ${s} calcTrx=${calcTrx}`);
                        if (allBuySort[b].roomName === 'W3S96' || allSellSort[s].roomName === 'W3S96') {
                            skipRoom++;
                            continue;
                        }
                        calcTrx++;
                        buyTrxCost = Game.market.calcTransactionCost(100, 'W3S96', allBuySort[b].roomName);
                        sellTrxCost = Game.market.calcTransactionCost(100, 'W3S96', allSellSort[s].roomName);
                        CentTrxCost = buyTrxCost + sellTrxCost;
                        trxByCredits = Math.floor((Game.market.credits * MARKET.CREDIT_RISK) / allSellSort[s].price);
                        trxByEnergy = Math.floor((Game.rooms.W3S96.terminal.store.energy * MARKET.ENERGY_RISK) / CentTrxCost * 100);
                        trxAmount = Math.min(trxByCredits, trxByEnergy, allBuySort[b].remainingAmount, allSellSort[s].remainingAmount);
                        TotalTrxCost = _.round(trxAmount * (CentTrxCost / 100), 2);
                        CreditsEarned = _.round((allBuySort[b].price - allSellSort[s].price) * trxAmount, 2);
                        EnergyCostPer = _.round(TotalTrxCost / CreditsEarned, 2);

                        if (EnergyCostPer < Best.EnergyCostPer) {
                            Best.buyId = allBuySort[b].id;
                            Best.sellId = allSellSort[s].id;
                            Best.resourceType = allSellSort[s].resourceType;
                            Best.sellPrice = allSellSort[s].price;
                            Best.buyPrice = allBuySort[b].price;
                            Best.trxAmount = trxAmount;
                            Best.buyTrxCost = buyTrxCost;
                            Best.sellTrxCost = sellTrxCost;
                            Best.CentTrxCost = CentTrxCost;
                            Best.trxByCredits = trxByCredits;
                            Best.trxByEnergy = trxByEnergy;
                            Best.TotalTrxCost = TotalTrxCost;
                            Best.CreditsEarned = CreditsEarned;
                            Best.EnergyCostPer = EnergyCostPer;
                        }
                        if (Display && EnergyCostPer < EnergyValue) {
                            resType = (allBuySort[b].resourceType + '      ').substr(0, 6);
                            console.log(`${resType} Buy[${b}]@${allBuySort[b].price} to Sell[${s}]@${allSellSort[s].price} TrxEnergy=${TotalTrxCost}(${buyTrxCost}+${sellTrxCost}) Credits=${CreditsEarned} E/C=${EnergyCostPer}`);
                            console.log(`--   Game.market.deal("${allSellSort[s].id}", ${trxAmount}, "W3S96"); Game.market.deal("${allBuySort[b].id}", ${trxAmount}, "W3S96");`);
                            console.log('--');
                        }
                    }
                } // end of Sell side Loop
            } // End of Buy side loop
            cpuDelta = Game.cpu.getUsed() - cpuB4;
            // resType = (resourceCode + '     ').substr(0, 6);
            // console.log(`Total ${resType} time=${cpuDelta.toFixed(3)} calcTrx=${calcTrx} avg=${ (cpuDelta / Math.max(calcTrx, 1)).toFixed(3)}`, ' -- sell, buy, matrix:', allSellSort.length, allBuySort.length, allSellSort.length * allBuySort.length);
            totalCalcTrx += calcTrx;
        } // **** End or resourceCode loop
        if (Display) {
            console.log(`*BEST* ${Best.resourceType} Buy@ ${Best.buyPrice} to Sell@ ${Best.sellPrice} TrxEnergy=${Best.TotalTrxCost}(${Best.buyTrxCost}+${Best.sellTrxCost}) Credits=${Best.CreditsEarned} E/C=${Best.EnergyCostPer}`);
            //console.log(`--   Game.market.deal("${Best.sellId}", ${Best.trxAmount}, "W3S96"); Game.market.deal("${Best.buyId}", ${Best.trxAmount}, "W3S96");`);
        }
        if (ExecTrx && Best.EnergyCostPer < EnergyValue) {
            if (Display || true) {
                console.log(`*ExecTrx* ${Best.resourceType} Buy@ ${Best.buyPrice} to Sell@ ${Best.sellPrice} TrxEnergy=${Best.TotalTrxCost}(${Best.buyTrxCost}+${Best.sellTrxCost}) Credits=${Best.CreditsEarned} E/C=${Best.EnergyCostPer}`);
                console.log(`--   Game.market.deal("${Best.sellId}", ${Best.trxAmount}, "W3S96"); Game.market.deal("${Best.buyId}", ${Best.trxAmount}, "W3S96");`);
            }
            ExecPart1 = Game.market.deal(Best.sellId, Best.trxAmount, "W3S96");
            if (ExecPart1 != 0) { // Not OK, some error
                if (Display) {
                    console.log(`ExecPart1=${ExecPart1}: ${translateErrorCode(ExecPart1)}`);
                }
            } else { // Opened TrxContract, need to close it next turn
                let CtxN = Memory.market.Ctx.length;
                Memory.market.Ctx[CtxN] = Best;
                Memory.market.Ctx[CtxN].open = true;
                Memory.market.Ctx[CtxN].trxActalAmt = Best.trxAmount;
                // let orderIdx = Infinity;
                // for (let it = 0; it < Game.market.incomingTransactions.length && orderIdx == Infinity; it++) {
                //     if (Game.market.incomingTransactions[it].order.id == Best.sellId) {
                //         orderIdx = it;
                //     }
                // }
                // if (orderIdx != Infinity) {
                //     inTrx = Game.market.incomingTransactions[orderIdx];
                //     Memory.market.Ctx[CtxN].trxActalAmt = inTrx.amount;
                //     console.log(`orderId[${orderIdx}]=${inTrx.order.id} received Amount=${inTrx.amount} of ${trxAmount}  CtxN=${CtxN}`);
                // } else {
                //     console.log(`*** No matching orderID *** CtxN=${CtxN}`);
                //     Memory.market.Ctx[CtxN].trxActalAmt = Best.trxAmount;
                // }

                // ExecPart2 = Game.market.deal(allBuySort[b].id, trxAmount, allBuySort[b].roomName);
                cmd1 = `ExecPart2=Memory.FutureTurn[t].ExecPart2 = Game.market.deal("${Best.buyId}", ${Memory.market.Ctx[CtxN].trxActalAmt}, "W3S96");`;
                cmd1 += `Memory.FutureTurn[t].CtxN = ${CtxN};`;
                if (Display) {
                    cmd1 += "console.log('ExecPart2=|'+ExecPart2+'|: |'+translateErrorCode(ExecPart2)+'|');";
                }
                let idx = Util.Future.cmd(+ 1, cmd1);
                cmd2 = `Util.MarketOp.goodTrade(${idx},${CtxN},${Display},${Game.market.credits})`;
                Util.Future.cmd(+ 2, cmd2);
            }
        }
        return Best;
    },
    goodTrade(idx, CtxN, Display, startCredits) {
        if (Display) {
            xProfit = Game.market.credits - startCredits;
            if (Memory.FutureTurn[idx].ExecPart2 === 0) {
                console.log(`Trade Success -- ${ (xProfit > 0
                    ? 'Good'
                    : '*BAD*')} PROFIT=${xProfit}`);
                Memory.market.Ctx[CtxN].open = false;
            } else {
                //  --> Memory.market.Ctx[CtxN].open remains TRUE ... TODO clean up "open=true"
                let eCode = Memory.FutureTurn[idx].ExecPart2;
                console.log("Trade **FALURE** Trade PROFIT=" + xProfit + `Error=|${eCode}|-${translateErrorCode(eCode)}`);
            }
        }
    },
    sell(resourceCode, maxQty, EnergyValue, ExecTrx = false, Display = true) {

        // Iterate through each ResourceType or just one that was Param1
        Best = {
            EnergyCostPer: Infinity,
            CreditsEarned: 0
        };
        let cpuDelta = 0;
        let cpuB4 = 0;
        let cpuB4s = 0;
        let totalCalcTrx = 0;
        let skipRoom = 0;
        // let allBuySort = [];
        // let allSellSort = [];

        allBuySort = Game.market.getAllOrders({type: ORDER_BUY, resourceType: resourceCode});
        if (Display) {
            // Sort gives better view but slower
            allBuySort = _.sortBy(allBuySort, 'price');
        }
        if (((Game.rooms.W3S96.terminal.store[resourceCode] || 0) - Util.MarketOp.saveResource(resourceCode)) > 0) {
            maxQty = Math.min(maxQty, Math.max((Game.rooms.W3S96.terminal.store[resourceCode] || 0) - Util.MarketOp.saveResource(resourceCode), 0))
        }
        // TODO finish sell function review from here ...
        for (let b = 0; b < allBuySort.length; b++) {
            if (allBuySort[b].roomName === 'W3S96' || (((Game.rooms.W3S96.terminal.store[allBuySort[b].resourceType] || 0) - MARKET.SELL_STOCK_HOLD) <= 0)) {
                continue;
            }
            if (allBuySort[b].roomName === undefined) {
                console.log(`***UNDEFINED*** [${b}].roomName at ${allBuySort[b].id} `);
                console.log(JSON.stringify(allBuySort[b]));
                continue;
            }
            buyTrxCost = Game.market.calcTransactionCost(1000, 'W3S96', allBuySort[b].roomName) / 1000;
            if (allBuySort[b].resourceType == RESOURCE_ENERGY) {
                trxByEnergy = Math.floor((Game.rooms.W3S96.terminal.store.energy * MARKET.SELL_ENERGY) / buyTrxCost);
                trxAmount = Math.min(trxByEnergy, allBuySort[b].remainingAmount, Math.floor(Game.rooms.W3S96.terminal.store.energy * 0.10));
                TotalTrxCost = _.round((trxAmount * buyTrxCost) + trxAmount, 2);
            } else {
                trxByEnergy = Math.floor((Game.rooms.W3S96.terminal.store.energy * MARKET.SELL_TRX_COST) / buyTrxCost);
                trxByStock = Math.max(0, (Game.rooms.W3S96.terminal.store[allBuySort[b].resourceType] || 0) - MARKET.SELL_STOCK_HOLD);
                trxAmount = Math.min(trxByEnergy, allBuySort[b].remainingAmount, trxByStock);
                TotalTrxCost = _.round(trxAmount * buyTrxCost, 2);
            }
            CreditsEarned = _.round(allBuySort[b].price * trxAmount, 2);
            EnergyCostPer = _.round(TotalTrxCost / CreditsEarned, 2);

            if (EnergyCostPer < EnergyValue) {
                if (EnergyCostPer < Best.EnergyCostPer) {
                    Best.b = b;
                    Best.buyId = allBuySort[b].id;
                    Best.resourceType = allBuySort[b].resourceType;
                    Best.trxAmount = trxAmount;
                    Best.buyTrxCost = buyTrxCost;
                    Best.trxByEnergy = trxByEnergy;
                    Best.trxByStock = trxByStock;
                    Best.TotalTrxCost = TotalTrxCost;
                    Best.CreditsEarned = CreditsEarned;
                    Best.EnergyCostPer = EnergyCostPer;
                }
                if (Display) {
                    console.log(`${allBuySort[b].resourceType} Buy[${b}]@${allBuySort[b].price} TrxEnergy=${TotalTrxCost}(${buyTrxCost}) Credits=${CreditsEarned} E/C=${EnergyCostPer}`);
                    console.log(`--   Game.market.deal("${allBuySort[b].id}", ${trxAmount}, "W3S96");`);
                    console.log('--');
                }
            }
        }
        if (Display) {
            console.log('Total Buy Orders in queue:', allBuySort.length);
        }
        if (Best.EnergyCostPer < Infinity) {
            if (Display) {
                console.log(`*BEST* ${allBuySort[Best.b].resourceType} Buy[${Best.b}]@${allBuySort[Best.b].price} TrxEnergy=${Best.TotalTrxCost}(${Best.buyTrxCost}) Credits=${Best.CreditsEarned} E/C=${Best.EnergyCostPer}`);
                console.log(`--   Game.market.deal("${allBuySort[Best.b].id}", ${Best.trxAmount}, "W3S96");`);
            }
            if (ExecTrx && Best.EnergyCostPer < EnergyValue) {
                ExecPart1 = Game.market.deal(allBuySort[Best.b].id, trxAmount, "W3S96");
                if (ExecPart1 != 0) {
                    if (Display) {
                        console.log(`-- **ERROR** ExecPart1=${ExecPart1}: ${translateErrorCode(ExecPart1)}`);
                    }
                } else {
                    // Add amount reduced from Terminal into display below
                    if (Display) {
                        console.log(`-- Done ExecPart1=${ExecPart1}: ${translateErrorCode(ExecPart1)}`);
                    }
                }
            }
        }
        return Best;
    },
    autoFind() {
        let resource = Memory.market.autoFind.resource;
        let minValue = Memory.market.autoFind.minValue;
        let skipTicks = Memory.market.autoFind.skipTicks;
        if (Game.rooms.W3S96.terminal.store.energy > MARKET.SELL_RESERVE && Game.cpu.bucket > MARKET.MIN_CPU_BUCKET && (Game.time % skipTicks) == 0) {
            let TrxContract = Util.MarketOp.find(resource, minValue, true, true);
        }
    },
    saveResource(resourceCode) {
        let retVal = [];
        retVal = {
            "energy": 90000,
            "G": 0,
            "GH": 0,
            "GH2O": 0,
            "GO": 0,
            "H": 1000,
            "K": 10000,
            "KH": 0,
            "KH2O": 0,
            "KHO2": 0,
            "KO": 0,
            "L": 10000,
            "LH": 0,
            "LH2O": 0,
            "LHO2": 0,
            "LO": 0,
            "O": 1000,
            "OH": 0,
            "power": 10,
            "token": 10000,
            "U": 1000,
            "UH": 0,
            "UH2O": 0,
            "UHO2": 0,
            "UL": 0,
            "UO": 0,
            "X": 1000,
            "XGH2O": 0,
            "XGHO2": 0,
            "XKH2O": 0,
            "XKHO2": 0,
            "XLH2O": 0,
            "XLHO2": 0,
            "XUH2O": 0,
            "XUHO2": 0,
            "XZH2O": 0,
            "XZHO2": 0,
            "Z": 1000,
            "ZH": 0,
            "ZH2O": 0,
            "ZHO2": 0,
            "ZK": 0,
            "ZO": 0
        };
        return retVal[resourceCode];
    },
    mBTinit(oneOrMany, resourceCode = 0) {
        let retVal = [];
        if (oneOrMany != null) {
            retVal[oneOrMany] = resourceCode;
        } else {
            retVal = {
                "energy": resourceCode,
                "G": resourceCode,
                "GH": resourceCode,
                "GH2O": resourceCode,
                "GO": resourceCode,
                "H": resourceCode,
                "K": resourceCode,
                "KH": resourceCode,
                "KH2O": resourceCode,
                "KHO2": resourceCode,
                "KO": resourceCode,
                "L": resourceCode,
                "LH": resourceCode,
                "LH2O": resourceCode,
                "LHO2": resourceCode,
                "LO": resourceCode,
                "O": resourceCode,
                "OH": resourceCode,
                "power": resourceCode,
                "token": resourceCode,
                "U": resourceCode,
                "UH": resourceCode,
                "UH2O": resourceCode,
                "UHO2": resourceCode,
                "UL": resourceCode,
                "UO": resourceCode,
                "X": resourceCode,
                "XGH2O": resourceCode,
                "XGHO2": resourceCode,
                "XKH2O": resourceCode,
                "XKHO2": resourceCode,
                "XLH2O": resourceCode,
                "XLHO2": resourceCode,
                "XUH2O": resourceCode,
                "XUHO2": resourceCode,
                "XZH2O": resourceCode,
                "XZHO2": resourceCode,
                "Z": resourceCode,
                "ZH": resourceCode,
                "ZH2O": resourceCode,
                "ZHO2": resourceCode,
                "ZK": resourceCode,
                "ZO": resourceCode
            };
        }
        return retVal;
    }
} // end of modules
