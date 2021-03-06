/**
 * @fileoverview 用JS实现简单版的区块链
 * @author lg
 * 【hash加密算法】 【分布式】
 */

const express = require('express');
const http_port = process.env.HTTP_PORT || 3000;
const CryptoJS = require('crypto-js');

/**
 * Block类：代表一个区块
 * @class
 */
class Block{
    /**
     * @constructor
     * @param {init} index - 区块的索引
     * @param {string} previousHash - 上一个块的哈希
     * @param {string} timestamp - 时间戳
     * @param {string} data - 区块上存储的数据
     * @param {string} hash - 当前区块的hash
     */
    constructor(index,previousHash,timestamp,data,hash){
        this.index = index;
        this.previousHash = previousHash;
        this.timestamp = timestamp;
        this.data = data;
        this.hash = hash;
    }
}

/**
 * 设置起源块
 * @returns {string|*} 返回初始的区块
 * @example
 * //returns Block
 * getGenesisBlock
 */
const getGenesisBlock = ()=>{
    return new Block(0,"0","1520135407868","lg genesis Block","243545gf4");
}

/** 
 * 创建下一个区块
*/
const generateNextBlock = (blockData)=>{
    //取到最后一个区块
    const previousBlock = getLastBlock();
    //下一个区块的各种信息
    const nextIndex = previousBlock.index + 1;
    const nextTimestamp = new Date().getTime() / 1000;
    const nextHash = calculateHash(nextIndex,previousBlock.hash,nextTimestamp,blockData);
    return new Block(nextIndex,previousBlock.hash,nextTimestamp,blockData,nextHash);
};

/**
 * 获得最后一个区块
 */
const getLastBlock = ()=>blockchain[blockchain.length-1];

/**
 * 计算hash
 */
const calculateHash = (index,previousHash,timestamp,data)=>{
    //固定的，用CryptoJS包的SHA256加密算法
    return CryptoJS.SHA256(index + previousHash + timestamp + data).toString();
}

/**
 * 加到链中
 */
const addBlock = (newBlock)=>{
    //需要验证
    if(isValidNewBlock(newBlock,getLastBlock())){
        blockchain.push(newBlock);//用数组的push方法增加
    }
};

/**
 * 验证新块是否有效
 */
const isValidNewBlock = (newBlock,previousBlock)=>{
    if(previousBlock.index + 1 !== newBlock.index){
        console.log("索引错误");
        return false;
    }else if(previousBlock.hash !== newBlock.previousHash){
        console.log("上一个hash计算错误");
        return false;
    }else if(calculateHashForBlock(newBlock) !== newBlock.hash){
        console.log("hash计算错误");
        return false;
    }else{
        return true;
    }
}

/**
 * 计算block的hash，add时的验证用
 */
const calculateHashForBlock = (block)=>{
    return calculateHash(block.index,block.previousHash,block.timestamp,block.data);
}

//装着block的数组
const blockchain = [getGenesisBlock()];

//创建一个P2P的server,单独新建一个文件哦
// const initP2PServer = ()=>{

// }

const initHttpServer = ()=>{
    const app = express();

    //获得起源块的信息
    app.use("/blocks",(req,res)=>{
        res.end(JSON.stringify(blockchain));
    });
    //挖矿，添加新的块
    app.use("/addblock",(req,res)=>{
        const newBlock = generateNextBlock(req.query.data);
        addBlock(newBlock);
        console.log("block added",JSON.stringify(newBlock));
        res.end();
    });

    app.use("/addPeer",(req,res)=>{
        connectToPeer(req.query.peer);
        res.end();
    });

    app.listen(http_port,()=>{
        console.log(`http server start on ${http_port}`);
    });
};
initHttpServer();




