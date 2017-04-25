//class marketOp {
module.exports = {

    init(force = false) {
        if (Memory.market === undefined || force) { // define Memory.market
            Memory.market = {
                Ctx: []
            };
            // Memory.market.Ctx[0] = {
            //     open: false,
            //     sellId: null
            // };
            Memory.market.autoFind = {
                resource: null, // null means all resources
                minValue: 80
            }
        }
    },
    buyToken(testBuy = false) {
        if (Game.cpu.bucket > 4000) {
            // cpuB4 = Game.cpu.getUsed();
            allSellSort = Game.market.getAllOrders({type: ORDER_SELL, resourceType: 'token'});
            allSellSort = _.sortBy(allSellSort, 'price');
            // cpuDelta = Game.cpu.getUsed() - cpuB4;
            // console.log(`buyToken  time=${cpuDelta.toFixed(3)}`);
            // for (let s = 0; s < allSellSort.length; s++) {
            //     console.log(`Sell[${s}]=`, allSellSort[s].price.toLocaleString());
            // }
            if (allSellSort[0].price <= Game.market.credits || testBuy) {
                console.log(`--- Game.market.deal("${allSellSort[0].id}", 1, "W3S96");`)
                let ExecPart1 = Game.market.deal(allSellSort[0].id, 1, "W3S96");
                if (ExecPart1 != 0) { // Not OK, some error
                    console.log(`*** Game.market.deal("${allSellSort[0].id}", 1, "W3S96"); ExecPart1=${ExecPart1}: ${translateErrorCode(ExecPart1)}`);
                } else {
                    console.log('************************************** PURCHASED TOKEN!!!!!!!');
                }
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
            let mBBT = 0;
            for (let b = 0; b < allBuySort.length; b++) {
                let aBSp = allBuySort[b].price;
                if (mBBT < aBSp) {
                    maxBuyByType[resourceCode] = aBSp;
                    mBBT = aBSp;
                }
            }
            //cpuDelta = Game.cpu.getUsed() - cpuB4;
            // console.log(`maxBuyByType  time=${cpuDelta.toFixed(3)}`);
            //cpuB4 = Game.cpu.getUsed();
            let mSBT = Infinity;
            for (let s = 0; s < allSellSort.length; s++) {
                let aSSp = allSellSort[s].price;
                //typeof minSellByType[aSS.resourceType] === "undefined" ||
                if (mSBT > aSSp) {
                    minSellByType[resourceCode] = aSSp;
                    mSBT = aSSp;
                }
            }
            //cpuDelta = Game.cpu.getUsed() - cpuB4;
            //console.log(`minSellByType time=${cpuDelta.toFixed(3)}`);
            cpuB4 = Game.cpu.getUsed();
            let calcTrx = 0;
            for (let b = 0; b < allBuySort.length; b++) {
                let aBS = allBuySort[b];
                // if (allBuySort[b].roomName === 'W3S96') {
                //     continue;
                // }
                if (aBS.price <= minSellByType[aBS.resourceType]) {
                    //console.log(`Buy **skip** ${b} ${aBS.resourceType} ${aBS.price}>${minSellByType[aBS.resourceType]}`);
                    continue;
                }
                //console.log(`Buy loop ${b} ${aBS.resourceType} $${aBS.price}>${minSellByType[aBS.resourceType]} |${(aBS.price > minSellByType[aBS.resourceType])}|`);
                for (let s = 0; s < allSellSort.length; s++) {
                    let aSS = allSellSort[s];
                    // if (aSS.roomName === 'W3S96') {
                    //     continue;
                    // }
                    if (aSS.price >= maxBuyByType[aSS.resourceType]) {
                        //console.log(`  Sell **skip** ${s} ${aSS.resourceType} ${aSS.price}>${maxBuyByType[aSS.resourceType]}`);
                        continue;
                    }
                    //console.log(`  Sell loop ${s} ${aSS.resourceType} $${aSS.price}`);
                    //console.log(`    max/min good ${b}/${aBS.resourceType}/${aSS.price} & ${s}/${aSS.resourceType}/${aSS.price} `);
                    if (aBS.price > aSS.price && aBS.resourceType == aSS.resourceType) {
                        //console.log(`    match to calcTrx ${b} & ${s} calcTrx=${calcTrx}`);
                        if (aBS.roomName === 'W3S96' || aSS.roomName === 'W3S96') {
                            skipRoom++;
                            continue;
                        }
                        calcTrx++;
                        buyTrxCost = Game.market.calcTransactionCost(100, 'W3S96', aBS.roomName);
                        sellTrxCost = Game.market.calcTransactionCost(100, 'W3S96', aSS.roomName);
                        CentTrxCost = buyTrxCost + sellTrxCost;
                        trxByCredits = Math.floor((Game.market.credits * MARKET.CREDIT_RISK) / aSS.price);
                        trxByEnergy = Math.floor((Game.rooms.W3S96.terminal.store.energy * MARKET.ENERGY_RISK) / CentTrxCost * 100);
                        trxAmount = Math.min(trxByCredits, trxByEnergy, aBS.remainingAmount, aSS.remainingAmount);
                        TotalTrxCost = _.round(trxAmount * (CentTrxCost / 100), 2);
                        CreditsEarned = _.round((aBS.price - aSS.price) * trxAmount, 2);
                        EnergyCostPer = _.round(TotalTrxCost / CreditsEarned, 2);

                        if (EnergyCostPer < Best.EnergyCostPer) {
                            Best.buyId = aBS.id;
                            Best.sellId = aSS.id;
                            Best.sellName = aSS.roomName;
                            Best.roomName = aBS.roomName;
                            Best.resourceType = aSS.resourceType;
                            Best.sellPrice = aSS.price;
                            Best.buyPrice = aBS.price;
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
                            resType = (aBS.resourceType + '      ').substr(0, 6);
                            console.log(`  ${resType} Buy[${b}-${aBS.roomName}]@${aBS.price} to Sell[${s}-${aSS.roomName}]@${aSS.price} TrxEnergy=${TotalTrxCost}(${buyTrxCost}+${sellTrxCost}) Credits=${CreditsEarned} E/C=${EnergyCostPer}`);
                            console.log(`--   Game.market.deal("${aSS.id}", ${trxAmount}, "W3S96"); Game.market.deal("${aBS.id}", ${trxAmount}, "W3S96");`);
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
        // if (Display) {
            console.log(`*BEST* ${Best.resourceType} Buy[${Best.roomName}] ${Best.buyPrice} to Sell[${Best.sellName}] ${Best.sellPrice} TrxEnergy=${Best.TotalTrxCost}(${Best.buyTrxCost}+${Best.sellTrxCost}) Credits=${Best.CreditsEarned} E/C=${Best.EnergyCostPer}`);
            //console.log(`--   Game.market.deal("${Best.sellId}", ${Best.trxAmount}, "W3S96"); Game.market.deal("${Best.buyId}", ${Best.trxAmount}, "W3S96");`);
        // }
        if (ExecTrx && Best.EnergyCostPer < EnergyValue) {
            // if (Display || true) {
                console.log(`*ExecTrx* ${Best.resourceType} Buy[${Best.roomName}] ${Best.buyPrice} to Sell[${Best.sellName}] ${Best.sellPrice} TrxEnergy=${Best.TotalTrxCost}(${Best.buyTrxCost}+${Best.sellTrxCost}) Credits=${Best.CreditsEarned} E/C=${Best.EnergyCostPer}`);
                console.log(`--   Game.market.deal("${Best.sellId}", ${Best.trxAmount}, "W3S96"); Game.market.deal("${Best.buyId}", ${Best.trxAmount}, "W3S96");`);
            // }
            ExecPart1 = Game.market.deal(Best.sellId, Best.trxAmount, "W3S96");
            if (ExecPart1 != 0) { // Not OK, some error
                // if (Display) {
                    console.log(`ExecPart1=${ExecPart1}: ${translateErrorCode(ExecPart1)}`);
                // }
            } else { // Opened TrxContract, need to close it next turn
                let CtxN = Memory.market.Ctx.length;
                Memory.market.Ctx[CtxN] = Best;
                Memory.market.Ctx[CtxN].open = true;
                Memory.market.Ctx[CtxN].trxActalAmt = Best.trxAmount;

                // ExecPart2 = Game.market.deal(aBS.id, trxAmount, aBS.roomName);
                cmd1 = `ExecPart2=Memory.FutureTurn[t].ExecPart2 = Game.market.deal("${Best.buyId}", ${Memory.market.Ctx[CtxN].trxActalAmt}, "W3S96");`;
                cmd1 += `Memory.FutureTurn[t].CtxN = ${CtxN};`;
                // if (Display) {
                    cmd1 += "console.log('ExecPart2=|'+ExecPart2+'|: |'+translateErrorCode(ExecPart2)+'|');";
                // }
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
    sell(resourceCode = 'energy', maxQty = 1000, EnergyValue = 50, ExecTrx = false, Display = true) {

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
                trxByStock = Infinity;
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

            if (EnergyCostPer < Best.EnergyCostPer) {
                Best.b = b;
                Best.buyId = allBuySort[b].id;
                Best.roomName = allBuySort[b].roomName;
                Best.resourceType = allBuySort[b].resourceType;
                Best.trxAmount = trxAmount;
                Best.buyTrxCost = buyTrxCost;
                Best.trxByEnergy = trxByEnergy;
                Best.trxByStock = trxByStock;
                Best.TotalTrxCost = TotalTrxCost;
                Best.CreditsEarned = CreditsEarned;
                Best.EnergyCostPer = EnergyCostPer;
            }
            if (Display && EnergyCostPer < EnergyValue) {
                console.log(`${allBuySort[b].resourceType} Buy[${b}-${allBuySort[b].roomName}]@${allBuySort[b].price} TrxEnergy=${TotalTrxCost}(${buyTrxCost}) Credits=${CreditsEarned} E/C=${EnergyCostPer}`);
                console.log(`--   Game.market.deal("${allBuySort[b].id}", ${trxAmount}, "W3S96");`);
                console.log('--');
            }
        }
        if (Display) {
            console.log('Total Buy Orders in queue:', allBuySort.length);
        }
        if (Best.EnergyCostPer < Infinity) {
            if (Display) {
                console.log(`*BEST* ${allBuySort[Best.b].resourceType} Buy[${Best.b}-${Best.roomName}] @${allBuySort[Best.b].price} TrxEnergy=${Best.TotalTrxCost}(${Best.buyTrxCost}) Credits=${Best.CreditsEarned} E/C=${Best.EnergyCostPer}`);
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
        if (Game.cpu.bucket > MARKET.MIN_CPU_BUCKET) {
            let resource = Memory.market.autoFind.resource;
            let minValue = Memory.market.autoFind.minValue;

            let TrxBest = Util.MarketOp.find(resource, minValue, false, false);
            let availableEnergy = Game.rooms.W3S96.terminal.store.energy;
            if ((availableEnergy > MARKET.SELL_RESERVE) || (TrxBest.EnergyCostPer / minValue < availableEnergy / MARKET.SELL_RESERVE)) {
                // TODO create makeTrade(Best) with will not search, just use Best object to execute trade
                let TrxContract = Util.MarketOp.find(TrxBest.resourceType, TrxBest.EnergyCostPer + 1, true, true);
            }
        }
    },
    saveResource(resourceCode) {
        let retVal = [];
        /* beautify ignore:start */
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
