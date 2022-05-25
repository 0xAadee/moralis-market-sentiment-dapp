import React, { useEffect, useState } from "react";
import "./App.css";
import { ConnectButton, Modal } from "web3uikit";
import logo from "./images/Moralis.png";
import Coin from "./components/Coin";
import { abouts } from "./about";
import { useMoralisWeb3Api, useMoralis } from "react-moralis";

const App = () => {
    const web3Api = useMoralisWeb3Api();
    const { Moralis, isInitialized } = useMoralis();

    const [btc, setBtc] = useState(80);
    const [eth, setEth] = useState(50);
    const [link, setLink] = useState(30);
    const [modalPrice, setModalPrice] = useState();
    const [visible, setVisible] = useState(false);
    const [modalToken, setModalToken] = useState();

    async function getRatio(ticker, setPercentage) {
        const votes = Moralis.Object.extend("Votes");
        const query = new Moralis.Query(votes);
        query.equalTo("ticker", ticker);
        query.descending("createdAt");
        const result = await query.first();
        let up = Number(result.attributes.up);
        let down = Number(result.attributes.down);
        let ratio = Math.round((up / (up + down)) * 100);
        setPercentage(ratio);
    }

    useEffect(() => {
        if (isInitialized) {
            getRatio("BTC", setBtc);
            getRatio("ETH", setEth);
            getRatio("LINK", setLink);

            async function createLiveQuery() {
                let query = new Moralis.Query("Votes");
                let subscription = await query.subscribe();
                subscription.on("update", (object) => {
                    if (object.attributes.ticker === "BTC") {
                        getRatio("BTC", setBtc);
                    } else if (object.attributes.ticker === "ETH") {
                        getRatio("ETH", setEth);
                    } else if (object.attributes.ticker === "LINK") {
                        getRatio("LINK", setLink);
                    }
                });
            }

            createLiveQuery();
        }
    }, [isInitialized]);

    useEffect(() => {
        async function fetchTokenPrice() {
            const options = {
                address:
                    abouts[abouts.findIndex((x) => x.token === modalToken)]
                        .address,
            };
            const price = await web3Api.token.getTokenPrice(options);
            setModalPrice(price.usdPrice.toFixed(2));
        }

        if (modalToken) {
            fetchTokenPrice();
        }
    }, [modalToken]);

    return (
        <>
            <div className="header">
                <div className="logo">
                    <img src={logo} alt="logo" height="50px" />
                    Sentiment
                </div>
                <ConnectButton />
            </div>
            <div className="instructions">
                Where do you think these tokens are going? Up or Down?
            </div>
            <div className="list">
                <Coin
                    percentage={btc}
                    setPercentage={setBtc}
                    token={"BTC"}
                    setModalToken={setModalToken}
                    setVisible={setVisible}
                />
                <Coin
                    percentage={eth}
                    setPercentage={setEth}
                    token={"ETH"}
                    setModalToken={setModalToken}
                    setVisible={setVisible}
                />
                <Coin
                    percentage={link}
                    setPercentage={setLink}
                    token={"LINK"}
                    setModalToken={setModalToken}
                    setVisible={setVisible}
                />
            </div>
            <Modal
                isVisible={visible}
                onCloseButtonPressed={() => {
                    setVisible(false);
                }}
                hasFooter={false}
                title={modalToken}
            >
                <div>
                    <span style={{ color: "white" }}>{"Price: "}</span>$
                    {modalPrice}
                </div>
                <div>
                    <span style={{ color: "white" }}>{"About"}</span>
                </div>
                <div>
                    {modalToken &&
                        abouts[abouts.findIndex((x) => x.token === modalToken)]
                            .about}
                </div>
            </Modal>
        </>
    );
};

export default App;
