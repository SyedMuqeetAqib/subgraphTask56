import { Address, BigInt, Bytes } from "@graphprotocol/graph-ts"
import {
  PhoenixDAO,
  Approval,
  Burn,
  OwnershipTransferred,
  Transfer
} from "../generated/PhoenixDAO/PhoenixDAO"
import { TokenDetail, TransactionHistory, User, StakeDetail, StakingUser } from "../generated/schema"

export function handleApproval(event: Approval): void {
  let transaction = TransactionHistory.load(event.block.number.toHex());
  if(!transaction){
    transaction = new TransactionHistory(event.block.number.toHex())
  transaction.to = event.params._owner;
  transaction.from = event.params._spender;
  transaction.method = "approve";
  transaction.amount = event.params._amount;
  transaction.save()
  }
  let id = event.params._spender.toHexString();
  let user = User.load(id);
  if(!user){
    user = new User(id);
    user.address = event.params._spender;
    user.currentBalance = BigInt.fromI32(0);
  }
  user.allowance = event.params._amount;
  user.save()

}

export function handleBurn(event: Burn): void {
  let transaction = TransactionHistory.load(event.block.number.toHex());
  if(!transaction){
    transaction = new TransactionHistory(event.block.number.toHex())
  transaction.to = Address.fromString("0x0000000000000000000000000000000000000000");
  transaction.from = event.params._burner;
  transaction.amount = event.params._amount;
  transaction.method = "burn";
  transaction.time = event.block.timestamp;
  transaction.block = event.block.number;
  transaction.save()
  }
  
  let id = event.params._burner.toHexString();
  let user = User.load(id);
  if(!user){
    user = new User(id);
  }
  user.address = event.params._burner;
  user.currentBalance = user.currentBalance.minus(event.params._amount);
  user.allowance = user.allowance;
  user.save();

}

export function handleOwnershipTransferred(event: OwnershipTransferred): void {
  let transaction = new TransactionHistory(event.block.number.toHex());
  transaction.to = event.params.newOwner;
  transaction.from = event.params.previousOwner;
  transaction.amount = BigInt.fromI32(0);
  transaction.method = "ownershipTransfer";
  transaction.time = event.block.timestamp;
  transaction.block = event.block.number;
  transaction.save()
}

export function handleTransfer(event: Transfer): void {
  if(event.params._to == Address.fromString("0xFa70F492D9f4fc28C8D6b9e65eac0B0AA363AF7F")){
    let transaction = TransactionHistory.load(event.block.number.toHex());
    if(!transaction){
      transaction = new TransactionHistory(event.block.number.toHex())
  transaction.from = event.params._from;
  transaction.to = event.params._to;
  transaction.method = "StakeComplete and Transfer";
  transaction.amount = event.params._amount;
  transaction.time = event.block.timestamp;
  transaction.block = event.block.number;
  transaction.save();
    }
  let id = event.params._to.toHexString();
  let user = StakingUser.load(id);
  if (!user) {
    user = new StakingUser(id);
    user.address = event.params._to;
    user.stakedAmount = event.params._amount;
    user.save();
  } else {
    user.stakedAmount = user.stakedAmount.plus(event.params._amount);
    user.save();
  }
  let stakeDetails = StakeDetail.load(
    Address.fromString(
      "0xFa70F492D9f4fc28C8D6b9e65eac0B0AA363AF7F"
    ).toHexString()
  );
  if (!stakeDetails) {
    stakeDetails = new StakeDetail(
      Address.fromString(
        "0xFa70F492D9f4fc28C8D6b9e65eac0B0AA363AF7F"
      ).toHexString()
    );
    stakeDetails.totalStakedAmount = event.params._amount;
    // stakeDetails.totalRewardAmount = event.params.rewardAmount;
    stakeDetails.save();
  } else {
    stakeDetails.totalStakedAmount = stakeDetails.totalStakedAmount.plus(
      event.params._amount
    );
    // stakeDetails.totalRewardAmount = stakeDetails.totalRewardAmount.plus(event.params.rewardAmount);
    stakeDetails.save();
  }
  }else if(event.params._from == Address.fromString("0xFa70F492D9f4fc28C8D6b9e65eac0B0AA363AF7F")){
    let transaction = TransactionHistory.load(event.block.number.toHex());
    if(!transaction){
      transaction = new TransactionHistory(event.block.number.toHex())
      transaction.from = event.params._from;
      transaction.to = event.params._to;
    transaction.method = "UnStake and Transfer";
    transaction.amount = event.params._amount;
    transaction.time = event.block.timestamp;
    transaction.block = event.block.number;
    transaction.save();}
  
    let id = event.params._to.toHexString();
    let user = StakingUser.load(id);
  
    if (user) {
      user.stakedAmount = event.params._amount;
      user.save();
    }
  
    let stakeDetails = StakeDetail.load(
      Address.fromString(
        "0xFa70F492D9f4fc28C8D6b9e65eac0B0AA363AF7F"
      ).toHexString()
    );
    if (stakeDetails) {
      stakeDetails.totalStakedAmount = stakeDetails.totalStakedAmount.minus(event.params._amount);
      // stakeDetails.totalRewardAmount = stakeDetails.totalRewardAmount;
      stakeDetails.save();
    }
  }
  else{
    let transaction = TransactionHistory.load(event.block.number.toHex());
    if(!transaction){
      transaction = new TransactionHistory(event.block.number.toHex())
  transaction.to = event.params._to;
  transaction.from = event.params._from;
  transaction.method = "transferToken";
  transaction.amount = event.params._amount;
  transaction.time = event.block.timestamp;
  transaction.block = event.block.number;
  transaction.save();
    }
}
  let tokenDetails = TokenDetail.load(Address.fromString("0x38A2fDc11f526Ddd5a607C1F251C065f40fBF2f7").toHexString());
if(!tokenDetails){
  tokenDetails = new TokenDetail(Address.fromString("0x38A2fDc11f526Ddd5a607C1F251C065f40fBF2f7").toHexString())
  tokenDetails.tokenMaxSupply = BigInt.fromI32(110000000);
  tokenDetails.holders = [];
}
let holders = tokenDetails.holders;
 let senderUser = User.load((event.params._from).toHexString());
 if(senderUser){
    senderUser.currentBalance = senderUser.currentBalance.minus(event.params._amount)
    if(holders.includes(senderUser.address.toHexString())){
      if(senderUser.currentBalance.minus(event.params._amount) === BigInt.fromI64(0)){
        const index = holders.indexOf(senderUser.address.toHexString());
              if(index > -1){
                holders.splice(index,1)
                tokenDetails.holders = holders;
              }
      }
    }else{
      if(senderUser.currentBalance.minus(event.params._amount) !== BigInt.fromI64(0)){
     holders.push(event.params._from.toHexString());
     tokenDetails.holders = holders;
      }
    }

    senderUser.save();
 }
 else{
  senderUser = new User(event.params._from.toHexString());
  senderUser.address = event.params._from;
  senderUser.currentBalance = senderUser.currentBalance;
  senderUser.allowance = event.params._amount;
  senderUser.save()
 }

  let receiverUser = User.load((event.params._to).toHexString());
  if(receiverUser){
    receiverUser.currentBalance = receiverUser.currentBalance.plus(event.params._amount)
    if(holders.includes(receiverUser.address.toHexString())){
      if(receiverUser.currentBalance.minus(event.params._amount) == BigInt.fromI64(0)){
        const index = holders.indexOf(receiverUser.address.toHexString());
              if(index > -1){
                holders.splice(index,1)
                tokenDetails.holders = holders;
              }
      }
    }else{
      if(receiverUser.currentBalance.minus(event.params._amount) != BigInt.fromI64(0)){
     holders.push(event.params._to.toHexString());
     tokenDetails.holders = holders;
      }
    }
    receiverUser.save();
 }
 else{
   receiverUser = new User(event.params._to.toHexString());
   receiverUser.address = event.params._to;
   receiverUser.currentBalance = receiverUser.currentBalance.plus(event.params._amount);
   receiverUser.allowance = event.params._amount;
   receiverUser.save()
 }
 tokenDetails.save()
}
