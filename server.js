import express from 'express';

import cors from 'cors';
import bodyParser from 'body-parser'

import https from "https";
import fs from "fs";
import path from 'path';

import crypto from 'crypto';
import CryptoJS from 'crypto-js';

import {EthWallet, MessageTypes} from "@okxweb3/coin-ethereum";

const app = express();
const port = 3333;

app.use(cors());
app.use(bodyParser.json());

app.post('/api/gen-wallet', async (req, res) => {
    
    try {
        
        let chainIndex = "evm";

        let now = new Date();
        let timestamp = now.getTime();
        let timestamp_isos = now.toISOString();
        let timestamp_str = timestamp.toString();

        req.body = { chainIndex , timestamp };
        
        const wallet = new Wallet();
        let ethWallet = new EthWallet();
        

        const walletCreds = await wallet.GenWallet(ethWallet, chainIndex, timestamp);
        
        const accountCreds = await wallet.createAccount(walletCreds, timestamp_str, timestamp_isos);
        
        const creationCreds = {
            "walletCreds": walletCreds,
            "accountCreds": accountCreds,
        }

        res.json(creationCreds);
    
    } catch (error) {

        console.error(error);
        res.status(500).json({ error: 'Gen Wallet Error' });
    
    }
});

app.post('/api/get-supported-chains', async (req, res) => {
    
    let now = new Date();
    
    const { chainIndex = "evm", timestamp=now.getTime() } = req.body;
    
    try {
        
        let timestamp_isos = now.toISOString();
        let timestamp_str = timestamp.toString();
        
        const wallet = new Wallet();
        let ethWallet = new EthWallet();
        
        const supportedChains = await wallet.getSupportedChains(timestamp_isos);


        res.json(supportedChains);
    
    } catch (error) {

        console.error(error);
        res.status(500).json({ error: 'Get supported chains Error' });
    
    }
});


//TODO : WRITE LOGIC VUE GET TOKEN ADDR
app.post('/api/get-current-token-price', async (req, res) => {
 
    try {
        
        let timestamp_isos = now.toISOString();
        let timestamp_str = timestamp.toString();
        
        const wallet = new Wallet();
        let ethWallet = new EthWallet();
        
        const currentTokenAddr = await wallet.getCurrentTokenPrice(chainIndexes, tokenAddress, timestamp_str, timestamp_isos);


        res.json(currentTokenAddr);
    
    } catch (error) {

        console.error(error);
        res.status(500).json({ error: 'Get current token price Error' });
    
    }
});


app.post('/api/save-mnemonics', async(req, res) => {
    const { mnemonics } = req.body;
    console.log('Received mnemonics:', mnemonics);
    
    // Здесь вы можете сохранить mnemonics в базе данных или выполнить другие действия


        try {
            let now = new Date();
            let timestamp = now.getTime();
            let timestamp_isos = now.toISOString();
            let timestamp_str = timestamp.toString();
            
            const wallet = new Wallet();
            let ethWallet = new EthWallet();
            
            const importedWalletCreds = await wallet.importWallet(mnemonics, ethWallet, timestamp_isos, timestamp_str);
    
    
            res.json(importedWalletCreds);
        
        } catch (error) {
    
            console.error(error);
            res.status(500).json({ error: 'Improt wallet Error' });
        
        }


});




app.post('/api/get-accountId', async (req, res) => {
    
    const { accountId } = req.body;
    console.log('Received accountID:', accountId);
    

    res.status(200).send({ message: 'AccountId saved successfully!' });

})

app.post('/api/get-history-by-account', async (req, res) => {
    const {accountId1} = req.body;
    try {
        let now = new Date();
        let timestamp = now.getTime();
        let timestamp_isos = now.toISOString();
        let timestamp_str = timestamp.toString();
        
        const wallet = new Wallet();
        let ethWallet = new EthWallet();
        
        const history = await wallet.getTxHistoryByAccount(accountId1, timestamp_isos);


        res.json(history);
    
    } catch (error) {


        console.error(error);
        res.status(500).json({ error: 'Get history Error' });
    
    }
});

app.post('get-specific-tx-info', (req, res) => {

})






const options = {
    key: fs.readFileSync("/root/cert/ocwvpn.ru/privkey.pem"),
    cert: fs.readFileSync("/root/cert/ocwvpn.ru/fullchain.pem")
};

https.createServer(options, app)
    .listen(port, function (req, res) {
    console.log("Server started at port 3333"); // Deploy
});





class Wallet {
    
    apiKey = process.env.API_KEY;
    secretKey = process.env.SECRET_KEY;
    passphrase = process.env.PASSPHRASE;
    project = process.env.PROJECT;
    baseUrl = process.env.BASE_URL;
  
    constructor() {
        this.apiKey = process.env.API_KEY;
        this.secretKey = process.env.SECRET_KEY;
        this.passphrase = process.env.PASSPHRASE;
        this.project = process.env.PROJECT;
        this.baseUrl = process.env.BASE_URL;
    }

    logApi(){
        console.log(process.env);
    }
    async GenWallet(wallet, chainIndex, timestamp) {
        let mnemonic = bip39.generateMnemonic();
    

        let param_private_key ={ 
            mnemonic: mnemonic,
            hdPath: await wallet.getDerivedPath({index: 0})
        }
        let privateKey = await wallet.getDerivedPrivateKey(param_private_key);

        let param_address = {
            privateKey: privateKey
        }
        let account = await wallet.getNewAddress(param_address);
        
        let addrParam = {
            address: account.address
        };
        let valid = await wallet.validAddress(addrParam);

        let credentials = {};

        switch (chainIndex) {
            case "evm":

                let t_str = timestamp.toString();
                let data = {
                    type: MessageTypes.PERSONAL_SIGN,
                    message: t_str
                };
                let signParams = {
                    privateKey: privateKey,
                    data: data
                };
                let result = await wallet.signMessage(signParams);

                let verifyMessageParams = {
                    signature: result,
                    data: data,
                    address: account.address
                };
                const verified = await wallet.verifyMessage(verifyMessageParams)


                credentials = {
                    "mnemonic": mnemonic,
                    "privateKey": privateKey,
                    "address": account.address,
                    "publicKey": account.publicKey,
                    "signature": result,
                    "timestamp":  t_str,
                    "verified": verified,
                    "hdPath": param_private_key.hdPath,
                    "validation": valid 
                }
            
                break;
            case "utxo":

                var msg = '' + Date.parse(new Date());
                console.log('msg', msg)


                let sign_params_utxo = {
                    privateKey: privateKey,
                    data: {
                        type: 0,
                        address: account.address,
                        message: msg,
                    }
                };

                let result_utxo = await wallet.signMessage(sign_params_utxo)
                console.info('signed result', result_utxo)


                let verify_message_params_utxo = {
                    signature: result_utxo,
                    data: {
                        message: msg,
                        type: 0,
                        publicKey: account.publicKey,
                    }
                };

                const verified_utxo = await wallet.verifyMessage(verify_message_params_utxo)
                console.info("verified", verified_utxo)
                credentials = {
                    "mnemonic": mnemonic,
                    "privateKey": privateKey,
                    "address": account.address,
                    "publicKey": account.publicKey,
                    "signature": result_utxo,
                    "timestamp":  timestamp,
                    "verified": verified_utxo,
                }
                break;
            case "ton":
                const param = {
                    address: account.address
                };
                const isValid = await wallet.validAddress(param);
                credentials = {
                    "mnemonic": mnemonic,
                    "privateKey": privateKey,
                    "address": account.address,
                    "publicKey": account.publicKey,
                    "signature": isValid.toString(),
                    "timestamp":  timestamp,
                    "verified": isValid,
                }
                break;
            case "tron":
                let message = "hello world";
                message = "0x" + Buffer.from(message, "utf8").toString("hex");

                const params= {
                    privateKey: "privateKey",
                    data: {
                        type: "hex",
                        message: message
                    }
                };
                const result_tron = await wallet.signMessage(params);
                credentials = {
                    "mnemonic": mnemonic,
                    "privateKey": privateKey,
                    "address": account.address,
                    "publicKey": account.publicKey,
                    "signature": result_tron.toString()
                }
                break;
            case "sol":
                var msg = '' + Date.parse(new Date());
                let param_sol= {
                    privateKey: privateKey, 
                    data: msg
                }
                let tx = await wallet.signMessage(param_sol);
                credentials = {
                    "mnemonic": mnemonic,
                    "privateKey": privateKey,
                    "address": account.address,
                    "publicKey": account.publicKey,
                    "signature": tx.toString(),
                    "timestamp":  timestamp,
                    "validation": valid,
                }
            default:
                break;
        }
        return credentials;

    }

    // async GenBtcWallet(wallet) {
    
    //         let privateKey = await wallet.getRandomPrivateKey();
    //         // native segwit address
    //         let params2 = {
    //         privateKey: privateKey,
    //         addressType: "segwit_native",
    //         };
    //         let address = await wallet.getNewAddress(params2);
            
    //         let signParams = {
    //             privateKey: privateKey,
    //             data: {
    //               type: 0,
    //               address: address.address,
    //               message: "hello world!",
    //             }
    //           };
    //           let res = await wallet.signMessage(signParams)
        
    //           let credentials = {
    //             "privateKey": privateKey,
    //             "address": address.address,
    //             "publicKey": address.publicKey,
    //             "signature": res
    //         }
    //         return credentials;
    //     }
        

    async createAccount(wallet_credentials, timestamp_str, timestamp_isos) {


        const required_url = `/api/v5/wallet/account/create-account`;
      
        const body = JSON.stringify({
          addresses: [
            {
              chainIndex: "1",
              address: wallet_credentials.address,
              publicKey: wallet_credentials.publicKey,
              signature: wallet_credentials.signature
            },
            {
              chainIndex: "10",
              address: wallet_credentials.address,
              publicKey: wallet_credentials.publicKey,
              signature: wallet_credentials.signature
            },
            {
              chainIndex: "43114",
              address: wallet_credentials.address,
              publicKey: wallet_credentials.publicKey,
              signature: wallet_credentials.signature
            },
            {
              chainIndex: "42161",
              address: wallet_credentials.address,
              publicKey: wallet_credentials.publicKey,
              signature: wallet_credentials.signature
            },
            {
              chainIndex: "56",
              address: wallet_credentials.address,
              publicKey: wallet_credentials.publicKey,
              signature: wallet_credentials.signature
            },
            {
                chainIndex: "8453",
                address: wallet_credentials.address,
                publicKey: wallet_credentials.publicKey,
                signature: wallet_credentials.signature
            },
            {
                chainIndex: "59144",
                address: wallet_credentials.address,
                publicKey: wallet_credentials.publicKey,
                signature: wallet_credentials.signature
            },
            {
                chainIndex: "1101",
                address: wallet_credentials.address,
                publicKey: wallet_credentials.publicKey,
                signature: wallet_credentials.signature
            },
            {
                chainIndex: "5000",
                address: wallet_credentials.address,
                publicKey: wallet_credentials.publicKey,
                signature: wallet_credentials.signature
            },
            {
                chainIndex: "324",
                address: wallet_credentials.address,
                publicKey: wallet_credentials.publicKey,
                signature: wallet_credentials.signature
            },
            {
                chainIndex: "1116",
                address: wallet_credentials.address,
                publicKey: wallet_credentials.publicKey,
                signature: wallet_credentials.signature
            },
            {
                chainIndex: "250",
                address: wallet_credentials.address,
                publicKey: wallet_credentials.publicKey,
                signature: wallet_credentials.signature
            },
            {
                chainIndex: "137",
                address: wallet_credentials.address,
                publicKey: wallet_credentials.publicKey,
                signature: wallet_credentials.signature
            },
            {
                chainIndex: "66",
                address: wallet_credentials.address,
                publicKey: wallet_credentials.publicKey,
                signature: wallet_credentials.signature
            },
            {
                chainIndex: "25",
                address: wallet_credentials.address,
                publicKey: wallet_credentials.publicKey,
                signature: wallet_credentials.signature
            },
            {
                chainIndex: "204",
                address: wallet_credentials.address,
                publicKey: wallet_credentials.publicKey,
                signature: wallet_credentials.signature
            },
            {
                chainIndex: "42170",
                address: wallet_credentials.address,
                publicKey: wallet_credentials.publicKey,
                signature: wallet_credentials.signature
            },
    
    
          ],
          signMessage: timestamp_str
        });
    
    
        let sign_creation = CryptoJS.enc.Base64.stringify(CryptoJS.HmacSHA256(timestamp_isos + 'POST' + required_url + body, this.secretKey));
    
        try {
            const response = await fetch('https://www.okx.com/api/v5/wallet/account/create-account', {
              method: 'POST',
              headers: {
                'Content-type': 'application/json; charset=UTF-8',
                'OK-ACCESS-PROJECT': this.project,
                'OK-ACCESS-KEY': this.apiKey,
                'OK-ACCESS-SIGN': sign_creation,
                'OK-ACCESS-PASSPHRASE': this.passphrase,
                'OK-ACCESS-TIMESTAMP': timestamp_isos
              },
              body: body
            });
            const json = await response.json();
            return json;
          } 
          catch (error) {
            console.error(error);
            return null;
          }
          
    }
    

    async getAccountDetails(accountId, timestamp_isos) {
        let sign_info = CryptoJS.enc.Base64.stringify(CryptoJS.HmacSHA256(timestamp_isos + 'GET' + `/api/v5/wallet/account/account-detail?accountId=${accountId}`, this.secretKey));
      
        try {
          const response = await fetch(`https://www.okx.com/api/v5/wallet/account/account-detail?accountId=${accountId}`, {
            headers: {
              'Content-type': 'application/json; charset=UTF-8',
              'OK-ACCESS-PROJECT': this.project,
              'OK-ACCESS-KEY': this.apiKey,
              'OK-ACCESS-SIGN': sign_info,
              'OK-ACCESS-PASSPHRASE': this.passphrase,
              'OK-ACCESS-TIMESTAMP': timestamp_isos
            }
          });
      
          if (!response.ok) {
            throw new Error(`Error ${response.status}: ${response.statusText}`);
          }
      
          const json = await response.json();
          if (!json.data) {
            throw new Error('No data returned from API');
          }
          return json;
        } catch (error) {
          console.error(error);
          return null;
        }
    }

    async getSigningInfo(chainIndex, fromAddr, toAddr, txAmount, timestamp_isos){
      
        const required_url = `/api/v5/wallet/pre-transaction/sign-info`;
      
        
        const postSingInfoBody = JSON.stringify({
            chainIndex: chainIndex,
            fromAddr: fromAddr,
            toAddr: toAddr,
            txAmount: txAmount
        });

        let sign_creation = CryptoJS.enc.Base64.stringify(CryptoJS.HmacSHA256(timestamp_isos + 'POST' + required_url + postSingInfoBody, this.secretKey));

        try{
            const response = await fetch(`https://www.okx.com/api/v5/wallet/pre-transaction/sign-info`, {
                method: 'POST',
                headers: {
                    'Content-type': 'application/json; charset=UTF-8',
                    'OK-ACCESS-PROJECT': this.project,
                    'OK-ACCESS-KEY': this.apiKey,
                    'OK-ACCESS-SIGN': sign_creation,
                    'OK-ACCESS-PASSPHRASE': this.passphrase,
                    'OK-ACCESS-TIMESTAMP': timestamp_isos
                },
                body:  postSingInfoBody,
            });
            const json = await response.json();
            return json;
        }catch(error){
            console.log(error);
            return null;
        }

    }

    async buildTx(fromAddr, wallet, toAddr, privateKey){
        
        let valid = await wallet.validAddress({
            address: fromAddr
        });
        

        console.log("verify address isValid: ", valid.isValid);

        let signParams = {
            privateKey: privateKey,
            data: {
                to: toAddr,
                value: new BigNumber(0),
                nonce: 5,
                gasPrice: new BigNumber(100 * 1000000000),
                gasLimit: new BigNumber(21000),
                chainId: 56
            }
        };
        let signedTx = await wallet.signTransaction(60, signParams);
        return signedTx;
    }

    async broadcastTx(singTx, accountId, chainIndex, address, timestamp_isos){
        
        
        const postSendTransactionBody = {
            "signedTx": singTx,
            "accountId": accountId,
            "chainIndex": chainIndex,
            "address": address,
        };


        const required_url = `api/v5/wallet/pre-transaction/broadcast-transaction`;
      

        let sign_creation = CryptoJS.enc.Base64.stringify(CryptoJS.HmacSHA256(timestamp_isos + 'POST' + required_url + postSendTransactionBody, this.secretKey));

        try{
            const response = await fetch(`https://www.okx.com/api/v5/wallet/pre-transaction/broadcast-transaction`, {
                method: 'POST',
                headers: {
                    'Content-type': 'application/json; charset=UTF-8',
                    'OK-ACCESS-PROJECT': this.project,
                    'OK-ACCESS-KEY': this.apiKey,
                    'OK-ACCESS-SIGN': sign_creation,
                    'OK-ACCESS-PASSPHRASE': this.passphrase,
                    'OK-ACCESS-TIMESTAMP': timestamp_isos
                },
                body:  postSendTransactionBody,
            });
            const json = await response.json();
            return json;
        }catch(error){
            console.log(error);
            return null;
        }
    }

    async getTotalBalanceByAddress(address, chains, timestamp_isos) {
        const required_url = `/api/v5/wallet/asset/total-value-by-address?address=${address}&chains=${chains}`;
    
        let sign_info = CryptoJS.enc.Base64.stringify(CryptoJS.HmacSHA256(timestamp_isos + 'GET' + required_url, this.secretKey));
    
        try {
            const response = await fetch(`https://www.okx.com${required_url}`, {
                method: 'GET',
                headers: {
                    'Content-type': 'application/json; charset=UTF-8',
                    'OK-ACCESS-PROJECT': this.project,
                    'OK-ACCESS-KEY': this.apiKey,
                    'OK-ACCESS-SIGN': sign_info,
                    'OK-ACCESS-PASSPHRASE': this.passphrase,
                    'OK-ACCESS-TIMESTAMP': timestamp_isos
                }
            });
    
            if (!response.ok) {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }
    
            const json = await response.json();
            console.log(json);
            if (!json.data) {
                throw new Error('No data returned from API');
            }
            return json;
        } catch (error) {
            console.error(error);
            return null;
        }
    }
    async getTotalBalancebyAccount(accountId, chains, timestamp_isos){
        const required_url = `/api/v5/wallet/asset/total-value?accountId=${accountId}}&chains=${chains}`;
    
        let sign_info = CryptoJS.enc.Base64.stringify(CryptoJS.HmacSHA256(timestamp_isos + 'GET' + required_url, this.secretKey));
    
        try {
            const response = await fetch(`https://www.okx.com${required_url}`, {
                method: 'GET',
                headers: {
                    'Content-type': 'application/json; charset=UTF-8',
                    'OK-ACCESS-PROJECT': this.project,
                    'OK-ACCESS-KEY': this.apiKey,
                    'OK-ACCESS-SIGN': sign_info,
                    'OK-ACCESS-PASSPHRASE': this.passphrase,
                    'OK-ACCESS-TIMESTAMP': timestamp_isos
                }
            });
    
            if (!response.ok) {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }
    
            const json = await response.json();
            console.log(json);
            if (!json.data) {
                throw new Error('No data returned from API');
            }
            return json;
        } catch (error) {
            console.error(error);
            return null;
        }
    }

    async getTotalTokenBalancebyAccount(accountId, chains, timestamp_isos){
        const required_url = `/api/v5/wallet/asset/wallet-all-token-balances?filter=&chains=${chains}1&accountId=${accountId}`;
    
        let sign_info = CryptoJS.enc.Base64.stringify(CryptoJS.HmacSHA256(timestamp_isos + 'GET' + required_url, this.secretKey));
    
        try {
            const response = await fetch(`https://www.okx.com${required_url}`, {
                method: 'GET',
                headers: {
                    'Content-type': 'application/json; charset=UTF-8',
                    'OK-ACCESS-PROJECT': this.project,
                    'OK-ACCESS-KEY': this.apiKey,
                    'OK-ACCESS-SIGN': sign_info,
                    'OK-ACCESS-PASSPHRASE': this.passphrase,
                    'OK-ACCESS-TIMESTAMP': timestamp_isos
                }
            });
    
            // if (!response.ok) {
            //     throw new Error(`Error ${response.status}: ${response.statusText}`);
            // }
    
            const json = await response.json();
            console.log(json);
            if (!json.data) {
                throw new Error('No data returned from API');
            }
            return json;
        } catch (error) {
            console.error(error);
            return null;
        }
    }

    async getTxHistoryByAddress(address, timestamp_isos){
        const required_url = `/api/v5/wallet/post-transaction/transactions-by-address?addresses=${address}}`;
    
        let sign_info = CryptoJS.enc.Base64.stringify(CryptoJS.HmacSHA256(timestamp_isos + 'GET' + required_url, this.secretKey));
    
        try {
            const response = await fetch(`https://www.okx.com${required_url}`, {
                method: 'GET',
                headers: {
                    'Content-type': 'application/json; charset=UTF-8',
                    'OK-ACCESS-PROJECT': this.project,
                    'OK-ACCESS-KEY': this.apiKey,
                    'OK-ACCESS-SIGN': sign_info,
                    'OK-ACCESS-PASSPHRASE': this.passphrase,
                    'OK-ACCESS-TIMESTAMP': timestamp_isos
                }
            });
    
            if (!response.ok) {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }
    
            const json = await response.json();
            console.log(json);
            if (!json.data) {
                throw new Error('No data returned from API');
            }
            return json;
        } catch (error) {
            console.error(error);
            return null;
        }
    }

    async getTxHistoryByAccount(accountId, timestamp_isos){
        const required_url = `/api/v5/wallet/post-transaction/transactions?accountId=${accountId}`;
    
        let sign_info = CryptoJS.enc.Base64.stringify(CryptoJS.HmacSHA256(timestamp_isos + 'GET' + required_url, this.secretKey));
    
        try {
            const response = await fetch(`https://www.okx.com${required_url}`, {
                method: 'GET',
                headers: {
                    'Content-type': 'application/json; charset=UTF-8',
                    'OK-ACCESS-PROJECT': this.project,
                    'OK-ACCESS-KEY': this.apiKey,
                    'OK-ACCESS-SIGN': sign_info,
                    'OK-ACCESS-PASSPHRASE': this.passphrase,
                    'OK-ACCESS-TIMESTAMP': timestamp_isos
                }
            });
    
            if (!response.ok) {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }
    
            const json = await response.json();
            console.log(json);
            if (!json.data) {
                throw new Error('No data returned from API');
            }
            return json;
        } catch (error) {
            console.error(error);
            return null;
        }
    }

    async getSpecificTx(chainId, txHash, timestamp_isos){
        const required_url = `/api/v5/wallet/post-transaction/transaction-detail-by-txhash?txHash=${txHash}&chainIndex=${chainId}`;
    
        let sign_info = CryptoJS.enc.Base64.stringify(CryptoJS.HmacSHA256(timestamp_isos + 'GET' + required_url, this.secretKey));
    
        try {
            const response = await fetch(`https://www.okx.com${required_url}`, {
                method: 'GET',
                headers: {
                    'Content-type': 'application/json; charset=UTF-8',
                    'OK-ACCESS-PROJECT': this.project,
                    'OK-ACCESS-KEY': this.apiKey,
                    'OK-ACCESS-SIGN': sign_info,
                    'OK-ACCESS-PASSPHRASE': this.passphrase,
                    'OK-ACCESS-TIMESTAMP': timestamp_isos
                }
            });
    
            if (!response.ok) {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }
    
            const json = await response.json();
            console.log(json);
            if (!json.data) {
                throw new Error('No data returned from API');
            }
            return json;
        } catch (error) {
            console.error(error);
            return null;
        }
    }

    async getCurrentTokenPrice(chainIndexes, tokenAddress,timestamp_str, timestamp_isos) { //TODO : REWORK : LOGIC PASSTE ADDRS


        const required_url = `/api/v5/wallet/token/current-price`;
      
        const body = JSON.stringify([
            {
                'chainIndex': `${chainIndexes}`,
                'tokenAddress': `${tokenAddress}`
            },
        ])


        let sign_creation = CryptoJS.enc.Base64.stringify(CryptoJS.HmacSHA256(timestamp_isos + 'POST' + required_url + body, this.secretKey));
    
        try {
            const response = await fetch(`https://www.okx.com${required_url}`, {
              method: 'POST',
              headers: {
                'Content-type': 'application/json; charset=UTF-8',
                'OK-ACCESS-PROJECT': this.project,
                'OK-ACCESS-KEY': this.apiKey,
                'OK-ACCESS-SIGN': sign_creation,
                'OK-ACCESS-PASSPHRASE': this.passphrase,
                'OK-ACCESS-TIMESTAMP': timestamp_isos
              },
              body: body
            });
            const json = await response.json();
            return json;
          } 
          catch (error) {
            console.error(error);
            return null;
          }
          
    }

    async getProjectInfo(chainId, tokenAddress, tokenName,timestamp_isos){
        const required_url = `/api/v5/wallet/token/token-detail?chainIndex=${chainId}&tokenName="${tokenName}"&tokenAddress=${tokenAddress}`;
    
        let sign_info = CryptoJS.enc.Base64.stringify(CryptoJS.HmacSHA256(timestamp_isos + 'GET' + required_url, this.secretKey));
    
        try {
            const response = await fetch(`https://www.okx.com${required_url}`, {
                method: 'GET',
                headers: {
                    'Content-type': 'application/json; charset=UTF-8',
                    'OK-ACCESS-PROJECT': this.project,
                    'OK-ACCESS-KEY': this.apiKey,
                    'OK-ACCESS-SIGN': sign_info,
                    'OK-ACCESS-PASSPHRASE': this.passphrase,
                    'OK-ACCESS-TIMESTAMP': timestamp_isos
                }
            });
    
            if (!response.ok) {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }
    
            const json = await response.json();
            console.log(json);
            if (!json.data) {
                throw new Error('No data returned from API');
            }
            return json;
        } catch (error) {
            console.error(error);
            return null;
        }
    }


    async getChainsByAccount(accountId, timestamp_isos){
        //https://www.okx.com/api/v5/wallet/account/account-detail

        const required_url = `/api/v5/wallet/account/account-detail?accountId=${accountId}`;
    
        let sign_info = CryptoJS.enc.Base64.stringify(CryptoJS.HmacSHA256(timestamp_isos + 'GET' + required_url, this.secretKey));
    
        try {
            const response = await fetch(`https://www.okx.com${required_url}`, {
                method: 'GET',
                headers: {
                    'Content-type': 'application/json; charset=UTF-8',
                    'OK-ACCESS-PROJECT': this.project,
                    'OK-ACCESS-KEY': this.apiKey,
                    'OK-ACCESS-SIGN': sign_info,
                    'OK-ACCESS-PASSPHRASE': this.passphrase,
                    'OK-ACCESS-TIMESTAMP': timestamp_isos
                }
            });
    
            if (!response.ok) {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }
    
            const json = await response.json();


    
           
            console.log(json);
            if (!json.data) {
                throw new Error('No data returned from API');
            }
            return json;
        } catch (error) {
            console.error(error);
            return null;
        }
    }

    async getSupportedChains(timestamp_isos){
        const required_url = `/api/v5/wallet/chain/supported-chains`;
    
        let sign_info = CryptoJS.enc.Base64.stringify(CryptoJS.HmacSHA256(timestamp_isos + 'GET' + required_url, this.secretKey));
    
        try {
            const response = await fetch(`https://www.okx.com${required_url}`, {
                method: 'GET',
                headers: {
                    'Content-type': 'application/json; charset=UTF-8',
                    'OK-ACCESS-PROJECT': this.project,
                    'OK-ACCESS-KEY': this.apiKey,
                    'OK-ACCESS-SIGN': sign_info,
                    'OK-ACCESS-PASSPHRASE': this.passphrase,
                    'OK-ACCESS-TIMESTAMP': timestamp_isos
                }
            });
    
            if (!response.ok) {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }
    
            const json = await response.json();
            console.log(json);
            if (!json.data) {
                throw new Error('No data returned from API');
            }
            return json;
        } catch (error) {
            console.error(error);
            return null;
        }
    }

    async importWallet(mnemonics, wallet, timestamp_isos, timestamp_str){
        const isValid = bip39.validateMnemonic(mnemonics);
        if(!isValid){
            console.error("invalid mnemonics")
            return 0;
        }
        else{
            let param_private_key ={ 
                mnemonic: mnemonics,
                hdPath: await wallet.getDerivedPath({index: 0})
            }
            let privateKey = await wallet.getDerivedPrivateKey(param_private_key);
    
            let param_address = {
                privateKey: privateKey
            }
            let account = await wallet.getNewAddress(param_address);
            

            let addrParam = {
                address: account.address
            };
            let valid = await wallet.validAddress(addrParam);

            
            let data = {
                type: MessageTypes.PERSONAL_SIGN,
                message: timestamp_str
            };

            let signParams = {
                privateKey: privateKey,
                data: data
            };
            let result = await wallet.signMessage(signParams);

            let verifyMessageParams = {
                signature: result,
                data: data,
                address: account.address
            };

            const verified = await wallet.verifyMessage(verifyMessageParams)


            let creds = {
                "mnemonic": mnemonics,
                "privateKey": privateKey,
                "address": account.address,
                "publicKey": account.publicKey,
                "signature": result,
                "timestamp":  timestamp_str,
                "verified": verified,
                "hdPath": param_private_key.hdPath,
                "validation": valid 
            }


                let account_creation_response = await this.createAccount(creds, timestamp_str, timestamp_isos);
                console.log(account_creation_response);


                if (account_creation_response.code === '81105') {
                    const accountIdMatch = account_creation_response.msg.match(/multi account ([\w-]+)/);
                    if (accountIdMatch && accountIdMatch[1]) {
                        const accountId = accountIdMatch[1];
                        console.log("Account ID:", accountId);
                        
                        let chains_by_account = await this.getChainsByAccount(accountId, timestamp_isos);
                        const data = chains_by_account.data[0].addresses;
                        console.log(data);
                        
                        const chainIndexes = data.map(item => item.chainIndex).join(',');
                        let chainIndexesStr = chainIndexes.toString();
                        console.log(chainIndexesStr);
                        
                        let balance = await this.getTotalBalanceByAddress(account.address, chainIndexesStr, timestamp_isos);
                        console.log(balance.data[0].totalValue);

                        // let tokenBalance = await this.getTotalTokenBalancebyAccount(accountId, chainIndexesStr, timestamp_isos);
                        // console.log(tokenBalance);

                        let WalletInfo = {
                            "address": account.address,
                            "publicKey": account.publicKey,
                            "balance": balance.data[0].totalValue,
                            "chains": chains_by_account.data[0].addresses,
                            "chainsIndexes": chainIndexesStr,
                            "timestamp": timestamp_str,
                            "timestampIso": timestamp_isos,
                            "mnemonic": mnemonics,
                            "privateKey": privateKey,
                            "hdPath": param_private_key.hdPath,
                            "validation": valid,
                            "accountId": accountId
                        }

                        return  WalletInfo;
                        
                                    

                    } else {
                        console.error("Account ID не найден в сообщении.");
                    }
                }
                


        } 
    }

    async sendTx(chainIndex, fromAddr, toAddr, txAmountInDollars, timestamp_isos, wallet, privateKey, tokenAddress, accountId){
        
        // const txAmount = txAmountInDollars;
        try {
            
         
            let timestamp_str = timestamp_isos.toString();
            
            let tokenPrice = await this.getCurrentTokenPrice(chainIndex, tokenAddress, timestamp_str, timestamp_isos);
            console.log(tokenPrice.data[0]);
            
            let bnbPriceInDollars = tokenPrice.data[0].price;

            let txAmountInBNBGwei = (txAmountInDollars / bnbPriceInDollars) * Math.pow(10, 9); // 1 BNB = 10^9 Gwei



            let singInfoResp = await this.getSigningInfo(chainIndex, fromAddr, toAddr, '1000', timestamp_isos);
            console.log(singInfoResp);
            
            let buildTxResp = await this.buildTx(fromAddr, wallet, toAddr, privateKey);
            console.log(buildTxResp);
            
            let broadcastTxResp = await this.broadcastTx(buildTxResp, accountId, chainIndex, fromAddr, timestamp_isos);
            console.log(broadcastTxResp);

            let txCreds = {
                "singInfo": singInfoResp,
                "buildTxInfo": buildTxResp,
                "broadcastTxInfo": broadcastTxResp
            }
            console.log(txCreds);
            return txCreds;
        }
        catch (error) {
            console.error(error);
            
            return 0;
        }
    }

    async getAddrsByAccount(accountId){
        const required_url = `/api/v5/wallet/account/account-detail?accountId=${accountId}`;
    
        let sign_info = CryptoJS.enc.Base64.stringify(CryptoJS.HmacSHA256(timestamp_isos + 'GET' + required_url, this.secretKey));
    
        try {
            const response = await fetch(`https://www.okx.com${required_url}`, {
                method: 'GET',
                headers: {
                    'Content-type': 'application/json; charset=UTF-8',
                    'OK-ACCESS-PROJECT': this.project,
                    'OK-ACCESS-KEY': this.apiKey,
                    'OK-ACCESS-SIGN': sign_info,
                    'OK-ACCESS-PASSPHRASE': this.passphrase,
                    'OK-ACCESS-TIMESTAMP': timestamp_isos
                }
            });
    
            if (!response.ok) {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }
    
            const json = await response.json();
            console.log(json);
            if (!json.data) {
                throw new Error('No data returned from API');
            }
            return json;
        } catch (error) {
            console.error(error);
            return null;
        }
    }
    
}
