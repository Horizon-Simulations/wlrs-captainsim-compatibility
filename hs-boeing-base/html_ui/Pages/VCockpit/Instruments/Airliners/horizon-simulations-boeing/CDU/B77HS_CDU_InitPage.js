class CDUInitPage {
    static ShowPage1(cdu) {
        cdu.clearDisplay();
        cdu.page.Current = cdu.page.InitPageA;
        cdu.pageRedrawCallback = () => CDUInitPage.ShowPage1(cdu);
        cdu.activeSystem = 'AIMS';
        cdu.coRoute.routes = [];

        const haveFlightPlan = cdu.flightPlanManager.getPersistentOrigin()
            && cdu.flightPlanManager.getDestination();

        const fromTo = new Column(23, "____|____", Column.amber, Column.right);
        const [coRouteAction, coRouteText, coRouteColor] = new CDU_SingleValueField(
            cdu,
            "string",
            cdu.coRoute.routeNumber,
            {
                emptyValue: haveFlightPlan ? "" : "__________[color]amber",
                suffix: "[color]cyan",
                maxLength: 10,
            },
            async (value) => {
                await cdu.updateCoRoute(value, (result) => {
                    if (result) {
                        CDUInitPage.ShowPage1(cdu);
                    } else {
                        scratchpadCallback();
                    }
                });
            }
        ).getFieldAsColumnParameters();

        const [flightNoAction, flightNoText, flightNoColor] = new CDU_SingleValueField(cdu,
            "string",
            cdu.flightNumber,
            {
                emptyValue: "________[color]amber",
                suffix: "[color]cyan",
                maxLength: 7
            },
            (value) => {
                cdu.updateFlightNo(value, (result) => {
                    if (result) {
                        CDUInitPage.ShowPage1(cdu);
                    } else {
                        cdu.setScratchpadUserData(value);
                    }
                });
            }
        ).getFieldAsColumnParameters();

        //;
        const altDest = new Column(0, "----|----------");
        let costIndexText = "---";
        let costIndexAction;
        let costIndexColor = Column.white;

        const cruiseFl = new Column(0, "-----");
        const cruiseTemp = new Column (10, "---°", Column.right);
        const cruiseFlTempSeparator = new Column(6, "/");

        let alignOption;
        const tropo = new Column(23, "36090", Column.small, Column.cyan, Column.right);
        let requestButton = "REQUEST*";
        let requestButtonLabel = "INIT";
        let requestEnable = true;

        if (cdu.simbrief.sendStatus === "REQUESTING") {
            requestEnable = false;
            requestButton = "REQUEST ";
        }

        if (cdu.flightPlanManager.getPersistentOrigin() && cdu.flightPlanManager.getPersistentOrigin().ident) {
            if (cdu.flightPlanManager.getDestination() && cdu.flightPlanManager.getDestination().ident) {
                fromTo.update(cdu.flightPlanManager.getPersistentOrigin().ident + "/" + cdu.flightPlanManager.getDestination().ident, Column.cyan);

                // If an active SimBrief OFP matches the FP, hide the request option
                // This allows loading a new OFP via INIT/REVIEW loading a different orig/dest to the current one
                if (cdu.simbrief.sendStatus != "DONE" ||
                    (cdu.simbrief["originIcao"] === cdu.flightPlanManager.getPersistentOrigin().ident && cdu.simbrief["destinationIcao"] === cdu.flightPlanManager.getDestination().ident)) {
                    requestEnable = false;
                    requestButtonLabel = "";
                    requestButton = "";
                }

                // Cost index
                [costIndexAction, costIndexText, costIndexColor] = new CDU_SingleValueField(cdu,
                    "int",
                    cdu.costIndexSet ? cdu.costIndex : null,
                    {
                        clearable: true,
                        emptyValue: "___[color]amber",
                        minValue: 0,
                        maxValue: 999,
                        suffix: "[color]cyan"
                    },
                    (value) => {
                        if (value != null) {
                            cdu.costIndex = value;
                            cdu.costIndexSet = true;
                        } else {
                            cdu.costIndexSet = false;
                            cdu.costIndex = 0;
                        }
                        CDUInitPage.ShowPage1(cdu);
                    }
                ).getFieldAsColumnParameters();

                cdu.onLeftInput[4] = costIndexAction;

                cruiseFl.update("_____", Column.amber);
                cruiseTemp.update("|___°", Column.amber);
                cruiseFlTempSeparator.updateAttributes(Column.amber);

                //This is done so pilot enters a FL first, rather than using the computed one
                if (cdu._cruiseEntered && cdu._cruiseFlightLevel) {
                    cruiseFl.update("FL" + cdu._cruiseFlightLevel.toFixed(0).padStart(3, "0"), Column.cyan);
                    if (cdu.cruiseTemperature) {
                        cruiseTemp.update(cdu.cruiseTemperature.toFixed(0) + "°", Column.cyan);
                        cruiseFlTempSeparator.updateAttributes(Column.cyan);
                    } else {
                        cruiseTemp.update(cdu.tempCurve.evaluate(cdu._cruiseFlightLevel).toFixed(0) + "°", Column.cyan, Column.small);
                        cruiseFlTempSeparator.updateAttributes(Column.cyan, Column.small);
                    }
                }

                // CRZ FL / FLX TEMP
                cdu.onLeftInput[5] = (value, scratchpadCallback) => {
                    if (cdu.setCruiseFlightLevelAndTemperature(value)) {
                        CDUInitPage.ShowPage1(cdu);
                    } else {
                        scratchpadCallback();
                    }
                };

                if (cdu.flightPlanManager.getPersistentOrigin()) {
                    alignOption = "IRS INIT>";
                }

                // Since CoRte isn't implemented, AltDest defaults to None Ref: Ares's documents
                altDest.update(cdu.altDestination ? cdu.altDestination.ident : "NONE", Column.cyan);

                cdu.onLeftInput[1] = async (value, scratchpadCallback) => {
                    switch (altDest.raw) {
                        case "NONE":
                            if (value === "") {
                                CDUAvailableFlightPlanPage.ShowPage(cdu);
                            } else {
                                if (await cdu.tryUpdateAltDestination(value)) {
                                    CDUInitPage.ShowPage1(cdu);
                                } else {
                                    scratchpadCallback();
                                }
                            }
                            break;
                        default:
                            if (value === "") {
                                CDUAvailableFlightPlanPage.ShowPage(cdu);
                            } else {
                                if (await cdu.tryUpdateAltDestination(value)) {
                                    CDUInitPage.ShowPage1(cdu);
                                } else {
                                    scratchpadCallback();
                                }
                            }
                            break;
                    }
                };
            }
        }

        cdu.onLeftInput[0] = coRouteAction;

        if (cdu.tropo) {
            tropo.update("" + cdu.tropo, Column.big);
        }
        cdu.onRightInput[4] = (value, scratchpadCallback) => {
            if (cdu.tryUpdateTropo(value)) {
                CDUInitPage.ShowPage1(cdu);
            } else {
                scratchpadCallback();
            }
        };

        /**
         * If scratchpad is filled, attempt to update city pair
         * else show route selection pair if city pair is displayed
         * Ref: FCOM 4.03.20 P6
         */
        cdu.onRightInput[0] = (value, scratchpadCallback) => {
            if (value !== "") {
                cdu.tryUpdateFromTo(value, (result) => {
                    if (result) {
                        CDUPerformancePage.UpdateThrRedAccFromOrigin(cdu);
                        CDUPerformancePage.UpdateEngOutAccFromOrigin(cdu);
                        CDUPerformancePage.UpdateThrRedAccFromDestination(cdu);
                        CDUAvailableFlightPlanPage.ShowPage(cdu);
                    } else {
                        scratchpadCallback();
                    }
                });
            } else if (cdu.flightPlanManager.getPersistentOrigin() && cdu.flightPlanManager.getPersistentOrigin().ident) {
                if (cdu.flightPlanManager.getDestination() && cdu.flightPlanManager.getDestination().ident) {
                    cdu.getCoRouteList(cdu).then(() => {
                        CDUAvailableFlightPlanPage.ShowPage(cdu);
                    });
                }
            }
        };
        cdu.onRightInput[1] = () => {
            if (requestEnable) {
                getSimBriefOfp(cdu, () => {
                    if (cdu.page.Current === cdu.page.InitPageA) {
                        CDUInitPage.ShowPage1(cdu);
                    }
                })
                    .then(() => {
                        insertUplink(cdu);
                    });
            }
        };
        cdu.rightInputDelay[2] = () => {
            return cdu.getDelaySwitchPage();
        };
        cdu.onRightInput[2] = () => {
            if (alignOption) {
                CDUIRSInit.ShowPage(cdu);
            }
        };

        const groundTemp = new Column(23, "---°", Column.right);
        if (cdu.groundTemp !== undefined) {
            groundTemp.update(cdu.groundTemp.toFixed(0) + "°", Column.cyan, (cdu.groundTempPilot !== undefined ? Column.big : Column.small));
        }

        cdu.onRightInput[5] = (scratchpadValue, scratchpadCallback) => {
            try {
                cdu.trySetGroundTemp(scratchpadValue);
                CDUInitPage.ShowPage1(cdu);
            } catch (msg) {
                if (msg instanceof cduMessage) {
                    cdu.setScratchpadMessage(msg);
                    scratchpadCallback();
                } else {
                    throw msg;
                }
            }
        };

        cdu.onLeftInput[2] = flightNoAction;

        cdu.setArrows(false, false, true, true);

        cdu.setTemplate(FormatTemplate([
            [
                new Column(10, "INIT")
            ],
            [
                new Column(1, "CO RTE"),
                new Column(21, "FROM/TO", Column.right)
            ],
            [
                new Column(0, coRouteText, coRouteColor),
                fromTo
            ],
            [
                new Column(0, "ALTN/CO RTE"),
                new Column(22, requestButtonLabel, Column.amber, Column.right)
            ],
            [
                altDest,
                new Column(23, requestButton, Column.amber, Column.right)
            ],
            [
                new Column(0, "FLT NBR")
            ],
            [
                new Column(0, flightNoText, flightNoColor),
                new Column(23, alignOption || "", Column.right)
            ],
            [""],
            [
                new Column(23, "WIND/TEMP>", Column.right)
            ],
            [
                new Column(0, "COST INDEX"),
                new Column(23, "TROPO", Column.right)
            ],
            [
                new Column(0, costIndexText, costIndexColor),
                tropo
            ],
            [
                new Column(0, "CRZ FL/TEMP"),
                new Column(23, "GND TEMP", Column.right)
            ],
            [
                cruiseFl,
                cruiseFlTempSeparator,
                cruiseTemp,
                groundTemp
            ]
        ]));

        cdu.onPrevPage = () => {
            cdu.goToFuelPredPage();
        };
        cdu.onNextPage = () => {
            cdu.goToFuelPredPage();
        };

        cdu.onRightInput[3] = () => {
            CDUWindPage.Return = () => {
                CDUInitPage.ShowPage1(cdu);
            };
            CDUWindPage.ShowPage(cdu);
        };

        cdu.onUp = () => {};
        try {
            Coherent.trigger("AP_ALT_VAL_SET", 4200);
            Coherent.trigger("AP_VS_VAL_SET", 300);
            Coherent.trigger("AP_HDG_VAL_SET", 180);
        } catch (e) {
            console.error(e);
        }
    }
    // Does not refresh page so that other things can be performed first as necessary
    static updateTowIfNeeded(cdu) {
        if (isFinite(cdu.taxiFuelWeight) && isFinite(cdu.zeroFuelWeight) && isFinite(cdu.blockFuel)) {
            cdu.takeOffWeight = cdu.zeroFuelWeight + cdu.blockFuel - cdu.taxiFuelWeight;
        }
    }
    static fuelPredConditionsMet(cdu) {
        return isFinite(cdu.blockFuel) &&
            isFinite(cdu.zeroFuelWeightMassCenter) &&
            isFinite(cdu.zeroFuelWeight) &&
            cdu.cruiseFlightLevel &&
            cdu.flightPlanManager.getWaypointsCount() > 0 &&
            cdu._zeroFuelWeightZFWCGEntered &&
            cdu._blockFuelEntered;
    }
    static trySetFuelPred(cdu) {
        if (CDUInitPage.fuelPredConditionsMet(cdu) && !cdu._fuelPredDone) {
            setTimeout(() => {
                if (CDUInitPage.fuelPredConditionsMet(cdu) && !cdu._fuelPredDone) { //Double check as user can clear block fuel during timeout
                    cdu._fuelPredDone = true;
                    if (cdu.page.Current === cdu.page.InitPageB) {
                        CDUInitPage.ShowPage2(cdu);
                    }
                }
            }, cdu.getDelayFuelPred());
        }
    }
    static ShowPage2(cdu) {
        cdu.clearDisplay();
        cdu.page.Current = cdu.page.InitPageB;
        cdu.activeSystem = 'AIMS';
        cdu.pageRedrawCallback = () => CDUInitPage.ShowPage2(cdu);

        const zfwCell = new Column(17, "___._", Column.amber, Column.right);
        const zfwCgCell = new Column(22, "__._", Column.amber, Column.right);
        const zfwCgCellDivider = new Column(18, "|", Column.amber, Column.right);

        if (cdu._zeroFuelWeightZFWCGEntered) {
            if (isFinite(cdu.zeroFuelWeight)) {
                zfwCell.update(NXUnits.kgToUser(cdu.zeroFuelWeight).toFixed(1), Column.cyan);
            }
            if (isFinite(cdu.zeroFuelWeightMassCenter)) {
                zfwCgCell.update(cdu.zeroFuelWeightMassCenter.toFixed(1), Column.cyan);
            }
            if (isFinite(cdu.zeroFuelWeight) && isFinite(cdu.zeroFuelWeightMassCenter)) {
                zfwCgCellDivider.updateAttributes(Column.cyan);
            }
        }
        cdu.onRightInput[0] = async (value, scratchpadCallback) => {
            if (value === "") {
                cdu.setScratchpadText(
                    (isFinite(getZfw()) ? (getZfw() / 1000).toFixed(1) : "") +
                    "/" +
                    (isFinite(getZfwcg()) ? getZfwcg().toFixed(1) : ""));
            } else {
                if (cdu.trySetZeroFuelWeightZFWCG(value)) {
                    CDUInitPage.updateTowIfNeeded(cdu);
                    CDUInitPage.ShowPage2(cdu);
                    CDUInitPage.trySetFuelPred(cdu);
                } else {
                    scratchpadCallback();
                }
            }
        };

        const blockFuel = new Column(23, "__._", Column.amber, Column.right);
        if (cdu._blockFuelEntered || cdu._fuelPlanningPhase === cdu._fuelPlanningPhases.IN_PROGRESS) {
            if (isFinite(cdu.blockFuel)) {
                blockFuel.update(NXUnits.kgToUser(cdu.blockFuel).toFixed(1), Column.cyan);
            }
        }
        cdu.onRightInput[1] = async (value, scratchpadCallback) => {
            if (cdu._zeroFuelWeightZFWCGEntered && value !== cdu.clrValue) { //Simulate delay if calculating trip data
                if (await cdu.trySetBlockFuel(value)) {
                    CDUInitPage.updateTowIfNeeded(cdu);
                    CDUInitPage.ShowPage2(cdu);
                    CDUInitPage.trySetFuelPred(cdu);
                } else {
                    scratchpadCallback();
                }
            } else {
                if (await cdu.trySetBlockFuel(value)) {
                    CDUInitPage.updateTowIfNeeded(cdu);
                    CDUInitPage.ShowPage2(cdu);
                } else {
                    scratchpadCallback();
                }
            }

        };

        const fuelPlanTopTitle = new Column(23, "", Column.amber, Column.right);
        const fuelPlanBottomTitle = new Column(23, "", Column.amber, Column.right);
        if (cdu._zeroFuelWeightZFWCGEntered && !cdu._blockFuelEntered) {
            fuelPlanTopTitle.text = "FUEL ";
            fuelPlanBottomTitle.text = "PLANNING }";
            cdu.onRightInput[2] = async () => {
                if (await cdu.tryFuelPlanning()) {
                    CDUInitPage.updateTowIfNeeded(cdu);
                    CDUInitPage.ShowPage2(cdu);
                }
            };
        }
        if (cdu._fuelPlanningPhase === cdu._fuelPlanningPhases.IN_PROGRESS) {
            fuelPlanTopTitle.update("BLOCK ", Column.green);
            fuelPlanBottomTitle.update("CONFIRM", Column.green);
            cdu.onRightInput[2] = async () => {
                if (await cdu.tryFuelPlanning()) {
                    CDUInitPage.updateTowIfNeeded(cdu);
                    CDUInitPage.ShowPage2(cdu);
                    CDUInitPage.trySetFuelPred(cdu);
                }
            };
        }

        const towCell = new Column(17, "---.-", Column.right);
        const lwCell = new Column(23, "---.-", Column.right);
        const towLwCellDivider = new Column(18, "/");
        const taxiFuelCell = new Column(0, "0.4", Column.cyan, Column.small);

        if (isFinite(cdu.taxiFuelWeight)) {
            if (cdu._taxiEntered) {
                taxiFuelCell.update(NXUnits.kgToUser(cdu.taxiFuelWeight).toFixed(1), Column.big);
            } else {
                taxiFuelCell.text = NXUnits.kgToUser(cdu.taxiFuelWeight).toFixed(1);
            }
        }
        cdu.onLeftInput[0] = async (value, scratchpadCallback) => {
            if (cdu._fuelPredDone) {
                setTimeout(async () => {
                    if (cdu.trySetTaxiFuelWeight(value)) {
                        CDUInitPage.updateTowIfNeeded(cdu);
                        if (cdu.page.Current === cdu.page.InitPageB) {
                            CDUInitPage.ShowPage2(cdu);
                        }
                    } else {
                        scratchpadCallback();
                    }
                }, cdu.getDelayHigh());
            } else {
                if (cdu.trySetTaxiFuelWeight(value)) {
                    CDUInitPage.updateTowIfNeeded(cdu);
                    CDUInitPage.ShowPage2(cdu);
                } else {
                    scratchpadCallback();
                }
            }
        };

        const tripWeightCell = new Column(4, "---.-", Column.right);
        const tripTimeCell = new Column(9, "----", Column.right);
        const tripCellDivider = new Column(5, "/");
        const rteRsvWeightCell = new Column(4, "---.-", Column.right);
        const rteRsvPercentCell = new Column(6, "5.0", Column.cyan);
        const rteRsvCellDivider = new Column(5, "/", Column.cyan);

        if (isFinite(cdu.getRouteReservedPercent())) {
            rteRsvPercentCell.text = cdu.getRouteReservedPercent().toFixed(1);
        }
        cdu.onLeftInput[2] = async (value, scratchpadCallback) => {
            if (await cdu.trySetRouteReservedPercent(value)) {
                CDUInitPage.ShowPage2(cdu);
            } else {
                scratchpadCallback();
            }
        };

        const altnWeightCell = new Column(4, "---.-", Column.right);
        const altnTimeCell = new Column(9, "----", Column.right);
        const altnCellDivider = new Column(5, "/");
        const finalWeightCell = new Column(4, "---.-", Column.right);
        const finalTimeCell = new Column(9, "----", Column.right);
        const finalCellDivider = new Column(5, "/");

        if (cdu.getRouteFinalFuelTime() > 0) {
            finalTimeCell.update(FMCMainDisplay.minutesTohhmm(cdu.getRouteFinalFuelTime()), Column.cyan);
            finalCellDivider.updateAttributes(Column.cyan);
        }
        cdu.onLeftInput[4] = async (value, scratchpadCallback) => {
            if (await cdu.trySetRouteFinalTime(value)) {
                CDUInitPage.ShowPage2(cdu);
            } else {
                scratchpadCallback();
            }
        };

        const extraWeightCell = new Column(18, "---.-", Column.right);
        const extraTimeCell = new Column(23, "----", Column.right);
        const extraCellDivider = new Column(19, "/");
        const minDestFob = new Column(4, "---.-", Column.right);
        const tripWindDirCell = new Column(19, "--");
        const tripWindAvgCell = new Column(21, "---");

        if (
            cdu.flightPlanManager.getPersistentOrigin() && cdu.flightPlanManager.getPersistentOrigin().ident
            && cdu.flightPlanManager.getDestination() && cdu.flightPlanManager.getDestination().ident
        ) {
            tripWindDirCell.update(cdu._windDir, Column.cyan, Column.small);
            tripWindAvgCell.update(cdu.averageWind.toFixed(0).padStart(3, "0"), Column.cyan);

            cdu.onRightInput[4] = async (value, scratchpadCallback) => {
                if (await cdu.trySetAverageWind(value)) {
                    CDUInitPage.ShowPage2(cdu);
                } else {
                    scratchpadCallback();
                }
            };
        }

        if (CDUInitPage.fuelPredConditionsMet(cdu)) {
            fuelPlanTopTitle.text = "";
            fuelPlanBottomTitle.text = "";

            cdu.tryUpdateTOW();
            if (isFinite(cdu.takeOffWeight)) {
                towCell.update(NXUnits.kgToUser(cdu.takeOffWeight).toFixed(1), Column.green, Column.small);
            }

            if (cdu._fuelPredDone) {
                if (!cdu.routeFinalEntered()) {
                    cdu.tryUpdateRouteFinalFuel();
                }
                if (isFinite(cdu.getRouteFinalFuelWeight()) && isFinite(cdu.getRouteFinalFuelTime())) {
                    if (cdu._rteFinalWeightEntered) {
                        finalWeightCell.update(NXUnits.kgToUser(cdu.getRouteFinalFuelWeight()).toFixed(1), Column.cyan);
                    } else {
                        finalWeightCell.update(NXUnits.kgToUser(cdu.getRouteFinalFuelWeight()).toFixed(1), Column.cyan, Column.small);
                    }
                    if (cdu._rteFinalTimeEntered || !cdu.routeFinalEntered()) {
                        finalTimeCell.update(FMCMainDisplay.minutesTohhmm(cdu.getRouteFinalFuelTime()), Column.cyan);
                    } else {
                        finalTimeCell.update(FMCMainDisplay.minutesTohhmm(cdu.getRouteFinalFuelTime()), Column.cyan, Column.small);
                        finalCellDivider.updateAttributes(Column.small);
                    }
                    finalCellDivider.updateAttributes(Column.cyan);
                }
                cdu.onLeftInput[4] = async (value, scratchpadCallback) => {
                    setTimeout(async () => {
                        if (await cdu.trySetRouteFinalFuel(value)) {
                            if (cdu.page.Current === cdu.page.InitPageB) {
                                CDUInitPage.ShowPage2(cdu);
                            }
                        } else {
                            scratchpadCallback();
                        }
                    }, cdu.getDelayHigh());
                };

                if (cdu.altDestination) {
                    if (cdu._routeAltFuelEntered) {
                        if (isFinite(cdu.getRouteAltFuelWeight())) {
                            altnWeightCell.update(NXUnits.kgToUser(cdu.getRouteAltFuelWeight()).toFixed(1), Column.cyan);
                            altnTimeCell.update(FMCMainDisplay.minutesTohhmm(cdu.getRouteAltFuelTime()), Column.green, Column.small);
                        }
                    } else {
                        cdu.tryUpdateRouteAlternate();
                        if (isFinite(cdu.getRouteAltFuelWeight())) {
                            altnWeightCell.update(NXUnits.kgToUser(cdu.getRouteAltFuelWeight()).toFixed(1), Column.cyan, Column.small);
                            altnTimeCell.update(FMCMainDisplay.minutesTohhmm(cdu.getRouteAltFuelTime()), Column.green, Column.small);
                        }
                    }
                    altnCellDivider.updateAttributes(Column.green, Column.small);
                } else {
                    altnWeightCell.update("0.0", Column.green, Column.small);
                }

                cdu.onLeftInput[3] = async (value, scratchpadCallback) => {
                    setTimeout(async () => {
                        if (await cdu.trySetRouteAlternateFuel(value)) {
                            if (cdu.page.Current === cdu.page.InitPageB) {
                                CDUInitPage.ShowPage2(cdu);
                            }
                        } else {
                            scratchpadCallback();
                        }
                    }, cdu.getDelayHigh());
                };

                cdu.tryUpdateRouteTrip();
                if (isFinite(cdu.getTotalTripFuelCons()) && isFinite(cdu.getTotalTripTime())) {
                    tripWeightCell.update(NXUnits.kgToUser(cdu.getTotalTripFuelCons()).toFixed(1), Column.green, Column.small);
                    tripTimeCell.update(FMCMainDisplay.minutesTohhmm(cdu._routeTripTime), Column.green, Column.small);
                    tripCellDivider.updateAttributes(Column.green, Column.small);
                }

                if (isFinite(cdu.getRouteReservedWeight())) {
                    if (cdu._rteReservedWeightEntered) {
                        rteRsvWeightCell.update(NXUnits.kgToUser(cdu.getRouteReservedWeight()).toFixed(1), Column.cyan);
                    } else {
                        rteRsvWeightCell.update(NXUnits.kgToUser(cdu.getRouteReservedWeight()).toFixed(1), Column.cyan, Column.small);
                    }
                }

                if (cdu._rteRsvPercentOOR) {
                    rteRsvPercentCell.update("--.-", Column.white);
                    rteRsvCellDivider.updateAttributes(Column.white);
                } else if (isFinite(cdu.getRouteReservedPercent())) {
                    if (cdu._rteReservedPctEntered || !cdu.routeReservedEntered()) {
                        rteRsvPercentCell.update(cdu.getRouteReservedPercent().toFixed(1), Column.cyan);
                    } else {
                        rteRsvPercentCell.update(cdu.getRouteReservedPercent().toFixed(1), Column.cyan, Column.small);
                        rteRsvCellDivider.updateAttributes(Column.small);
                    }
                }

                cdu.onLeftInput[2] = async (value, scratchpadCallback) => {
                    setTimeout(async () => {
                        if (await cdu.trySetRouteReservedFuel(value)) {
                            if (cdu.page.Current === cdu.page.InitPageB) {
                                CDUInitPage.ShowPage2(cdu);
                            }
                        } else {
                            scratchpadCallback();
                        }
                    }, cdu.getDelayMedium());
                };

                cdu.tryUpdateLW();
                lwCell.update(NXUnits.kgToUser(cdu.landingWeight).toFixed(1), Column.green, Column.small);
                towLwCellDivider.updateAttributes(Column.green, Column.small);

                tripWindDirCell.update(cdu._windDir, Column.small);
                tripWindAvgCell.update("000", Column.small);

                if (isFinite(cdu.averageWind)) {
                    tripWindDirCell.update(cdu._windDir, Column.small);
                    tripWindAvgCell.update(cdu.averageWind.toFixed(0).padStart(3, "0"), Column.big);
                }
                cdu.onRightInput[4] = async (value, scratchpadCallback) => {
                    setTimeout(async () => {
                        if (await cdu.trySetAverageWind(value)) {
                            if (cdu.page.Current === cdu.page.InitPageB) {
                                CDUInitPage.ShowPage2(cdu);
                            }
                        } else {
                            scratchpadCallback();
                        }
                    }, cdu.getDelayWindLoad());
                };

                if (cdu._minDestFobEntered) {
                    minDestFob.update(NXUnits.kgToUser(cdu._minDestFob).toFixed(1), Column.cyan);
                } else {
                    cdu.tryUpdateMinDestFob();
                    minDestFob.update(NXUnits.kgToUser(cdu._minDestFob).toFixed(1), Column.cyan, Column.small);
                }
                cdu.onLeftInput[5] = async (value, scratchpadCallback) => {
                    setTimeout(async () => {
                        if (await cdu.trySetMinDestFob(value)) {
                            if (cdu.page.Current === cdu.page.InitPageB) {
                                CDUInitPage.ShowPage2(cdu);
                            }
                        } else {
                            scratchpadCallback();
                        }
                    }, cdu.getDelayHigh());
                };
                cdu.checkEFOBBelowMin();

                extraWeightCell.update(NXUnits.kgToUser(cdu.tryGetExtraFuel()).toFixed(1), Column.green, Column.small);
                if (cdu.tryGetExtraFuel() >= 0) {
                    extraTimeCell.update(FMCMainDisplay.minutesTohhmm(cdu.tryGetExtraTime()), Column.green, Column.small);
                    extraCellDivider.updateAttributes(Column.green, Column.small);
                }
            }
        }

        cdu.setArrows(false, false, true, true);

        cdu.setTemplate(FormatTemplate([
            [
                new Column(5, "INIT FUEL PRED")
            ],
            [
                new Column(0, "TAXI"),
                new Column(15, "ZFW/ZFWCG")
            ],
            [
                taxiFuelCell,
                zfwCell,
                zfwCgCellDivider,
                zfwCgCell
            ],
            [
                new Column(0, "TRIP"),
                new Column(5, "/TIME"),
                new Column(19, "BLOCK")
            ],
            [
                tripWeightCell,
                tripCellDivider,
                tripTimeCell,
                blockFuel
            ],
            [
                new Column(0, "RTE RSV/%"),
                fuelPlanTopTitle
            ],
            [
                rteRsvWeightCell,
                rteRsvCellDivider,
                rteRsvPercentCell,
                fuelPlanBottomTitle
            ],
            [
                new Column(0, "ALTN"),
                new Column(5, "/TIME"),
                new Column(15, "TOW/"),
                new Column(22, "LW")
            ],
            [
                altnWeightCell,
                altnCellDivider,
                altnTimeCell,
                towCell,
                towLwCellDivider,
                lwCell
            ],
            [
                new Column(0, "FINAL/TIME"),
                new Column(15, "TRIP WIND")
            ],
            [
                finalWeightCell,
                finalCellDivider,
                finalTimeCell,
                tripWindDirCell,
                tripWindAvgCell
            ],
            [
                new Column(0, "MIN DEST FOB"),
                new Column(14, "EXTRA/TIME")
            ],
            [
                minDestFob,
                extraWeightCell,
                extraCellDivider,
                extraTimeCell
            ]
        ]));

        cdu.onPrevPage = () => {
            CDUInitPage.ShowPage1(cdu);
        };
        cdu.onNextPage = () => {
            CDUInitPage.ShowPage1(cdu);
        };
    }

    // Defining as static here to avoid duplicate code in CDUIRSInit
    static ConvertDDToDMS(deg, lng) {
        // converts decimal degrees to degrees minutes seconds
        const M = 0 | (deg % 1) * 60e7;
        let degree;
        if (lng) {
            degree = (0 | (deg < 0 ? -deg : deg)).toString().padStart(3, "0");
        } else {
            degree = 0 | (deg < 0 ? -deg : deg);
        }
        return {
            dir : deg < 0 ? lng ? 'W' : 'S' : lng ? 'E' : 'N',
            deg : degree,
            min : Math.abs(0 | M / 1e7),
            sec : Math.abs((0 | M / 1e6 % 1 * 6e4) / 100)
        };
    }
}