/**
 * @param {org.dis.model.CreateInsurance} createInsuranceData
 * @transaction
 */
async function CreateInsurance(createInsuranceData){
  /**
   * This transaction adds an insurance whose insurance Id is same as transaction Id
   * The date of the insurance is same as the timestamp of transaction
   */ 

  // Check if each of the nominees actually exists

  let participantRegistry = await getParticipantRegistry('org.dis.model.Person');
  let persons = await participantRegistry.getAll();
  let personIds = [];
  for(let i in persons){
    personIds.push(persons[i].personId);
  }
  personIds.sort();
  
  let serializer = getSerializer();
  
  for(let i in createInsuranceData.insuranceNominees){
    
    let id = serializer.toJSON(createInsuranceData.insuranceNominees[i]).personId;
    let exists = false;
    let low = 0;
    let high = personIds.length - 1;
    while(low <= high){
      let mid = (low + high) >> 1;
      if(personIds[mid] == id){
        exists = true;
        break;
      }
      else if(personIds[mid] < id){
        low = mid + 1;
      }
      else{
        high = mid - 1;
      }
    }
    if(exists == false){
      throw "No such nominee "+id+" exists.";
    }
  }
  
  /**
   * If all the nominees are valid, then continue with the transaction
   */
  const factory = getFactory();
  
  let insuranceMetadata = factory.newResource('org.dis.model','InsuranceMetadata', createInsuranceData.transactionId);
  insuranceMetadata.insuranceExpiry = createInsuranceData.insuranceExpiry;
  insuranceMetadata.insuranceStatus = "0";

  let assetRegistry1 = await getAssetRegistry('org.dis.model.InsuranceMetadata');
  await assetRegistry1.add(insuranceMetadata);
  
  let insurance = factory.newResource('org.dis.model','Insurance', createInsuranceData.transactionId);
  insurance.insuranceId = createInsuranceData.transactionId;
  insurance.insuranceDate = createInsuranceData.timestamp.toString();
  insurance.insuranceData = createInsuranceData.insuranceData;
  insurance.insuranceNominees = createInsuranceData.insuranceNominees;
  insurance.insuranceKey = createInsuranceData.insuranceKey;
  insurance.insuranceIssuer = createInsuranceData.insuranceIssuer;
  insurance.insuranceMetadata = factory.newRelationship('org.dis.model','InsuranceMetadata',createInsuranceData.transactionId);
  let assetRegistry2 = await getAssetRegistry('org.dis.model.Insurance');
  await assetRegistry2.add(insurance);
}


/**
 * @param {org.dis.model.ClaimInsurance} claimInsuranceData
 * @transaction
 */
async function ClaimInsurance(claimInsuranceData){

  let assetRegistry = await getAssetRegistry('org.dis.model.InsuranceMetadata');
  let insurance = await assetRegistry.get(claimInsuranceData.insuranceId);
  insurance.status = "3";
  await assetRegistry.update(insurance);
  
}

/**
 * @param {org.dis.model.InvalidateInsuranceAfterExpiration} invalidateInsuranceData
 * @transaction
 */
async function InvalidateInsuranceAfterExpiration(invalidateInsuranceData){
  
  let assetRegistry = await getAssetRegistry('org.dis.model.InsuranceMetadata');
  let insurance = await assetRegistry.get(invalidateInsuranceData.insuranceId);
  
  let date1 = new Date(insurance.insuranceExpiry);
  let date2 = new Date();
  
  if(date1 > date2){
    throw "The insurance has not expired yet.";
  }
  
  insurance.status = "1";
  await assetRegistry.update(insurance);
  
}

/**
 * @param {org.dis.model.InvalidateInsuranceBeforeExpiration} invalidateInsuranceData
 * @transaction
 */
async function InvalidateInsuranceBeforeExpiration(invalidateInsuranceData){

  let assetRegistry = await getAssetRegistry('org.dis.model.InsuranceMetadata');
  let insurance = await assetRegistry.get(invalidateInsuranceData.insuranceId);
  insurance.status = "2";
  await assetRegistry.update(insurance);
  
}

/**
 * @param {org.dis.model.UpdateInsuranceExpirationDate} updateInsuranceData
 * @transaction
 */
async function UpdateInsuranceExpirationDate(updateInsuranceData){

  let assetRegistry = await getAssetRegistry('org.dis.model.InsuranceMetadata');
  let insurance = await assetRegistry.get(updateInsuranceData.insuranceId);
  
  let date1 = new Date(insurance.insuranceExpiry);
  let date2 = new Date(updateInsuranceData.insuranceExpiry);
  if(date2 < date1){
    throw "New Expiry date must be greater than existing expiry date";
  }
  insurance.insuranceExpiry = updateInsuranceData.insuranceExpiry;
  await assetRegistry.update(insurance);
  
}