const { LCDClient, MnemonicKey, MsgSend , Fee, SignMode, Tx } = require("@xpla/xpla.js");
const { Tx: Tx_pb } = require("@xpla/xpla.proto/cosmos/tx/v1beta1/tx");

const lcd = new LCDClient({
    chainID: 'cube_47-5',
    URL: 'https://cube-lcd.xpla.dev'
});

const mk1 = new MnemonicKey({
    mnemonic: 'allow shoulder caution engage zone pony caution stomach this produce alien welcome fury wagon chef index just home because paper story solar magnet female',
})

const mk2 = new MnemonicKey({
    mnemonic: 'supply outer size broccoli hybrid trophy dutch pumpkin humble awesome drastic pistol dwarf damp trouble foil dismiss speak early method tube able bag life',
})

const mk3 = new MnemonicKey({
    mnemonic: 'flat bargain margin luxury town host vital matter dumb pole fuel hub female medal ankle ski distance town sign crunch dignity custom dynamic original',
})

const main = async () => {
    // mk1, mk2 가 각각 서로에게 25 axpla를 전달하고, mk3 이 gas fee 대납하는 상황
    const from1 = lcd.wallet(mk1).key.accAddress; // xpla1vdch40yjqeqfptnq5nkgd29933yk3weyc08rku
    const from2 = lcd.wallet(mk2).key.accAddress; // xpla1xszf68cz7aul4tfnypgz56m45crv7dyz2vph5r
    const from3 = lcd.wallet(mk3).key.accAddress; // xpla15l4s4kj3972vunayq8y3esf40r0ev9auywegvv

    const balance1 = await lcd.bank.balance(from1); 
    const balance2 = await lcd.bank.balance(from1); 
    const balance3= await lcd.bank.balance(from3); 

    console.log("before from1", JSON.stringify(balance1, null, 2));
    console.log("before from2", JSON.stringify(balance2, null, 2));
    console.log("before from3", JSON.stringify(balance3, null, 2));

    const msgsend1 = new MsgSend(from1, from2, { axpla: 25 });
    const msgsend2 = new MsgSend(from2, from1, { axpla: 25 });

    const fee = new Fee(200000, "170000000000000000axpla", from3); 
    const tx = await lcd.tx.create([], { msgs: [msgsend1, msgsend2], fee }); // Creating the transaction

    const acc1 = await lcd.auth.accountInfo(from1) // Getting wallet information
    const userSignOption1 = { // Signing details 
        chainID: 'cube_47-5',
        accountNumber: acc1.account_number,
        sequence: acc1.sequence,
        signMode: SignMode.SIGN_MODE_LEGACY_AMINO_JSON
    }

    const acc2 = await lcd.auth.accountInfo(from2) // Getting wallet information
    const userSignOption2 = { // Signing details 
        chainID: 'cube_47-5',
        accountNumber: acc2.account_number,
        sequence: acc2.sequence,
        signMode: SignMode.SIGN_MODE_LEGACY_AMINO_JSON
    }

    const acc3 = await lcd.auth.accountInfo(from3) // Getting wallet information
    const userSignOption3 = { // Signing details 
        chainID: 'cube_47-5',
        accountNumber: acc3.account_number,
        sequence: acc3.sequence,
        signMode: SignMode.SIGN_MODE_LEGACY_AMINO_JSON
    }

    const signedTx1 = await lcd.wallet(mk1).key.signTx(tx, userSignOption1) // Signing
    // const encodedSignedTx1 = encodeTx(signedTx1);
    // console.log('encodedSignedTx1', encodedSignedTx1); // 서버 클라 통신은 이렇게 encoding해서 사용
    // const originSignedTx1 = decodeTx(encodedSignedTx1);
    const signedTx2 = await lcd.wallet(mk2).key.signTx(tx, userSignOption2) // Signing
    const signedTx3 = await lcd.wallet(mk3).key.signTx(tx, userSignOption3) // Signing

    // signedTx3에 signer_infos와 signatures를 추가하는걸로 하자.
    signedTx1.signatures.push(signedTx2.signatures[0], signedTx3.signatures[0]);
    signedTx1.auth_info.signer_infos.push(signedTx2.auth_info.signer_infos[0], signedTx3.auth_info.signer_infos[0]);
    const txResult = await lcd.tx.broadcastSync(signedTx1);
    console.log(txResult);

    // signedTx3.signatures.push(signedTx1.signatures[0], signedTx2.signatures[0]);
    // signedTx3.auth_info.signer_infos.push(signedTx1.auth_info.signer_infos[0], signedTx2.auth_info.signer_infos[0]);
    // const txResult = await lcd.tx.broadcastSync(signedTx3);
    // {
    //     height: 0,
    //     txhash: 'FC24543DE9D73DB54608466E7E03FB8F8FF56233A260FAF8A5AA8AD452EA6D44',
    //     raw_log: 'pubKey does not match signer address xpla1vdch40yjqeqfptnq5nkgd29933yk3weyc08rku with signer index: 0: invalid pubkey',
    //     code: 8,
    //     codespace: 'sdk'
    //   }

    setTimeout(async () => {
        const afterbalance1 = await lcd.bank.balance(from1); // Balance details
        const afterbalance2 = await lcd.bank.balance(from1); // Balance details
        const afterbalance3= await lcd.bank.balance(from3); // Balance details
        console.log("after from1", JSON.stringify(afterbalance1, null, 2));
        console.log("after from2", JSON.stringify(afterbalance2, null, 2));
        console.log("after from3", JSON.stringify(afterbalance3, null, 2));
    }, 6000)
}
main();

const encodeTx = (tx) => {
   return Buffer.from(tx.toBytes()).toString('base64')
}

const decodeTx = (encodedTx) => {
    const tx_pb = Tx_pb.decode(Buffer.from(encodedTx, 'base64'));
    return Tx.fromProto(tx_pb);
}