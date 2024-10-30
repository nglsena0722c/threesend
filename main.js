const { LCDClient, MnemonicKey, MsgStoreCode, MsgSend , Fee, SignMode } = require("@xpla/xpla.js");
const fs = require('fs');

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
    // mk1, mk2 가 각각 서로에게 25 axpla를 전달하고, mk3 이 gas fee 대납
    const from1 = lcd.wallet(mk1).key.accAddress;
    const from2 = lcd.wallet(mk2).key.accAddress;
    const from3 = lcd.wallet(mk3).key.accAddress;

    const balance1 = await lcd.bank.balance(from1); 
    const balance2 = await lcd.bank.balance(from1); 
    const balance3= await lcd.bank.balance(from3); 
    console.log("before from1", JSON.stringify(balance1, null, 2));
    console.log("before from2", JSON.stringify(balance2, null, 2));
    console.log("before from3", JSON.stringify(balance3, null, 2));

    const msgsend1 = new MsgSend(from1, from2, { axpla: 25 });
    const msgsend2 = new MsgSend(from2, from1, { axpla: 25 });

    const fee = new Fee(200000, "170000000000000000axpla", from3) 
    const tx = await lcd.tx.create([], { msgs: [msgsend1, msgsend2], fee }) // Creating the transaction

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
    const signedTx2 = await lcd.wallet(mk2).key.signTx(signedTx1, userSignOption2) // Signing
    const signedTx3 = await lcd.wallet(mk3).key.signTx(signedTx2, userSignOption3) // Signing
    const txResult = await lcd.tx.broadcastSync(signedTx3);
    console.log(txResult);

    setTimeout(async () => {
        const afterbalance1 = await lcd.bank.balance(from1); // Balance details
        const afterbalance2 = await lcd.bank.balance(from1); // Balance details
        const afterbalance3= await lcd.bank.balance(from3); // Balance details
        console.log("after from1", JSON.stringify(afterbalance1, null, 2));
        console.log("after from2", JSON.stringify(afterbalance2, null, 2));
        console.log("after from3", JSON.stringify(afterbalance3, null, 2));
    }, 6000)
}
main()