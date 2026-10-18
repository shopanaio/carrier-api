// AUTO-GENERATED FILE. DO NOT EDIT DIRECTLY.
// Pins the exact field set (names and optionality) and primitive types of every request and response type,
// walking the Swagger snapshot independently of the type renderer. Run `yarn generate:types` to refresh.
import type * as T from '../src';

type Eq<A, B> = (<X>() => X extends A ? 1 : 2) extends <X>() => X extends B ? 1 : 2 ? true : false;
type Assert<V extends true> = V;
type Req<O> = { [K in keyof O]-?: {} extends Pick<O, K> ? never : K }[keyof O];

export type Pin0 = Assert<Eq<keyof NonNullable<T.AuthRequestBody>, 'username' | 'password'>>; // AuthRequestBody keys
export type Pin1 = Assert<Eq<Req<NonNullable<T.AuthRequestBody>>, 'username' | 'password'>>; // AuthRequestBody required
export type Pin2 = Assert<Eq<NonNullable<NonNullable<T.AuthRequestBody>['username']>, string>>; // AuthRequestBody.username
export type Pin3 = Assert<Eq<NonNullable<NonNullable<T.AuthRequestBody>['password']>, string>>; // AuthRequestBody.password
export type Pin4 = Assert<Eq<keyof NonNullable<T.AuthResult>, 'token' | 'refresh_token' | 'expiresIn'>>; // AuthResult keys
export type Pin5 = Assert<Eq<Req<NonNullable<T.AuthResult>>, never>>; // AuthResult required
export type Pin6 = Assert<Eq<NonNullable<NonNullable<T.AuthResult>['token']>, string>>; // AuthResult.token
export type Pin7 = Assert<Eq<NonNullable<NonNullable<T.AuthResult>['refresh_token']>, string>>; // AuthResult.refresh_token
export type Pin8 = Assert<Eq<NonNullable<NonNullable<T.AuthResult>['expiresIn']>, number>>; // AuthResult.expiresIn
export type Pin9 = Assert<Eq<keyof NonNullable<T.RefreshTokenRequestBody>, 'refreshToken'>>; // RefreshTokenRequestBody keys
export type Pin10 = Assert<Eq<Req<NonNullable<T.RefreshTokenRequestBody>>, 'refreshToken'>>; // RefreshTokenRequestBody required
export type Pin11 = Assert<Eq<NonNullable<NonNullable<T.RefreshTokenRequestBody>['refreshToken']>, string>>; // RefreshTokenRequestBody.refreshToken
export type Pin12 = Assert<Eq<keyof NonNullable<T.RefreshTokenResult>, 'token' | 'refresh_token' | 'expiresIn'>>; // RefreshTokenResult keys
export type Pin13 = Assert<Eq<Req<NonNullable<T.RefreshTokenResult>>, never>>; // RefreshTokenResult required
export type Pin14 = Assert<Eq<NonNullable<NonNullable<T.RefreshTokenResult>['token']>, string>>; // RefreshTokenResult.token
export type Pin15 = Assert<Eq<NonNullable<NonNullable<T.RefreshTokenResult>['refresh_token']>, string>>; // RefreshTokenResult.refresh_token
export type Pin16 = Assert<Eq<NonNullable<NonNullable<T.RefreshTokenResult>['expiresIn']>, number>>; // RefreshTokenResult.expiresIn
export type Pin17 = Assert<Eq<keyof NonNullable<NonNullable<T.BannersResult>[number]>, 'url' | 'file'>>; // BannersResult[] keys
export type Pin18 = Assert<Eq<Req<NonNullable<NonNullable<T.BannersResult>[number]>>, never>>; // BannersResult[] required
export type Pin19 = Assert<
  Eq<keyof NonNullable<NonNullable<NonNullable<T.BannersResult>[number]>['url']>, 'UA' | 'EN' | 'RU'>
>; // BannersResult[].url keys
export type Pin20 = Assert<Eq<Req<NonNullable<NonNullable<NonNullable<T.BannersResult>[number]>['url']>>, never>>; // BannersResult[].url required
export type Pin21 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<NonNullable<T.BannersResult>[number]>['url']>['UA']>, string>
>; // BannersResult[].url.UA
export type Pin22 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<NonNullable<T.BannersResult>[number]>['url']>['EN']>, string>
>; // BannersResult[].url.EN
export type Pin23 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<NonNullable<T.BannersResult>[number]>['url']>['RU']>, string>
>; // BannersResult[].url.RU
export type Pin24 = Assert<
  Eq<keyof NonNullable<NonNullable<NonNullable<T.BannersResult>[number]>['file']>, 'UA' | 'EN' | 'RU'>
>; // BannersResult[].file keys
export type Pin25 = Assert<Eq<Req<NonNullable<NonNullable<NonNullable<T.BannersResult>[number]>['file']>>, never>>; // BannersResult[].file required
export type Pin26 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<NonNullable<T.BannersResult>[number]>['file']>['UA']>, string>
>; // BannersResult[].file.UA
export type Pin27 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<NonNullable<T.BannersResult>[number]>['file']>['EN']>, string>
>; // BannersResult[].file.EN
export type Pin28 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<NonNullable<T.BannersResult>[number]>['file']>['RU']>, string>
>; // BannersResult[].file.RU
export type Pin29 = Assert<Eq<keyof T.CheckPhoneOnParcelPathParams, 'barCode' | 'phoneCheck'>>; // CheckPhoneOnParcelPathParams keys
export type Pin30 = Assert<Eq<Req<T.CheckPhoneOnParcelPathParams>, 'barCode' | 'phoneCheck'>>; // CheckPhoneOnParcelPathParams required
export type Pin31 = Assert<Eq<NonNullable<T.CheckPhoneOnParcelPathParams['barCode']>, string>>; // CheckPhoneOnParcelPathParams.barCode
export type Pin32 = Assert<Eq<NonNullable<T.CheckPhoneOnParcelPathParams['phoneCheck']>, string>>; // CheckPhoneOnParcelPathParams.phoneCheck
export type Pin33 = Assert<
  Eq<keyof NonNullable<T.CheckPhoneOnParcelResult>, 'PhoneCorrespondsParcel' | 'phone' | 'parcel'>
>; // CheckPhoneOnParcelResult keys
export type Pin34 = Assert<Eq<Req<NonNullable<T.CheckPhoneOnParcelResult>>, never>>; // CheckPhoneOnParcelResult required
export type Pin35 = Assert<Eq<NonNullable<NonNullable<T.CheckPhoneOnParcelResult>['PhoneCorrespondsParcel']>, boolean>>; // CheckPhoneOnParcelResult.PhoneCorrespondsParcel
export type Pin36 = Assert<Eq<NonNullable<NonNullable<T.CheckPhoneOnParcelResult>['phone']>, string>>; // CheckPhoneOnParcelResult.phone
export type Pin37 = Assert<Eq<NonNullable<NonNullable<T.CheckPhoneOnParcelResult>['parcel']>, string>>; // CheckPhoneOnParcelResult.parcel
export type Pin38 = Assert<Eq<keyof T.ContractClientInfoPathParams, 'contractID'>>; // ContractClientInfoPathParams keys
export type Pin39 = Assert<Eq<Req<T.ContractClientInfoPathParams>, 'contractID'>>; // ContractClientInfoPathParams required
export type Pin40 = Assert<Eq<NonNullable<T.ContractClientInfoPathParams['contractID']>, string>>; // ContractClientInfoPathParams.contractID
export type Pin41 = Assert<
  Eq<
    keyof NonNullable<T.ContractClientInfoResult>,
    | 'contractID'
    | 'contract'
    | 'number'
    | 'edrpou'
    | 'allowedCOD'
    | 'date'
    | 'dateTo'
    | 'deleted'
    | 'client'
    | 'clientID'
    | 'clientFullName'
    | 'phone'
    | 'eMail'
    | 'client_code'
    | 'client_country'
    | 'client_countryID'
    | 'client_region'
    | 'client_regionID'
    | 'client_area'
    | 'client_areaID'
    | 'client_street'
    | 'client_streetID'
    | 'client_cityID'
    | 'client_city'
    | 'client_building'
    | 'client_flat'
    | 'client_postalCode'
    | 'client_mainCounterparty'
    | 'client_mainCounterpartyID'
    | 'client_mainCounterparty_edrpou'
    | 'client_mainCounterpartySel'
    | 'client_mainCounterpartySelID'
    | 'contract_term'
    | 'ContractSupportManager'
    | 'ContractSupportManagerID'
    | 'ContractAttractionManager'
    | 'ContractAttractionManagerID'
  >
>; // ContractClientInfoResult keys
export type Pin42 = Assert<
  Eq<
    Req<NonNullable<T.ContractClientInfoResult>>,
    | 'contractID'
    | 'contract'
    | 'number'
    | 'edrpou'
    | 'allowedCOD'
    | 'date'
    | 'dateTo'
    | 'deleted'
    | 'client'
    | 'clientID'
    | 'clientFullName'
    | 'phone'
    | 'eMail'
    | 'client_code'
    | 'client_country'
    | 'client_countryID'
    | 'client_region'
    | 'client_regionID'
    | 'client_area'
    | 'client_areaID'
    | 'client_street'
    | 'client_streetID'
    | 'client_cityID'
    | 'client_city'
    | 'client_building'
    | 'client_flat'
    | 'client_postalCode'
    | 'client_mainCounterparty'
    | 'client_mainCounterpartyID'
    | 'client_mainCounterparty_edrpou'
    | 'contract_term'
  >
>; // ContractClientInfoResult required
export type Pin43 = Assert<Eq<NonNullable<NonNullable<T.ContractClientInfoResult>['contractID']>, string>>; // ContractClientInfoResult.contractID
export type Pin44 = Assert<Eq<NonNullable<NonNullable<T.ContractClientInfoResult>['contract']>, string>>; // ContractClientInfoResult.contract
export type Pin45 = Assert<Eq<NonNullable<NonNullable<T.ContractClientInfoResult>['number']>, string>>; // ContractClientInfoResult.number
export type Pin46 = Assert<Eq<NonNullable<NonNullable<T.ContractClientInfoResult>['edrpou']>, string>>; // ContractClientInfoResult.edrpou
export type Pin47 = Assert<Eq<NonNullable<NonNullable<T.ContractClientInfoResult>['allowedCOD']>, boolean>>; // ContractClientInfoResult.allowedCOD
export type Pin48 = Assert<Eq<NonNullable<NonNullable<T.ContractClientInfoResult>['date']>, string>>; // ContractClientInfoResult.date
export type Pin49 = Assert<Eq<NonNullable<NonNullable<T.ContractClientInfoResult>['dateTo']>, string>>; // ContractClientInfoResult.dateTo
export type Pin50 = Assert<Eq<NonNullable<NonNullable<T.ContractClientInfoResult>['deleted']>, boolean>>; // ContractClientInfoResult.deleted
export type Pin51 = Assert<Eq<NonNullable<NonNullable<T.ContractClientInfoResult>['client']>, string>>; // ContractClientInfoResult.client
export type Pin52 = Assert<Eq<NonNullable<NonNullable<T.ContractClientInfoResult>['clientID']>, string>>; // ContractClientInfoResult.clientID
export type Pin53 = Assert<Eq<NonNullable<NonNullable<T.ContractClientInfoResult>['clientFullName']>, string>>; // ContractClientInfoResult.clientFullName
export type Pin54 = Assert<Eq<NonNullable<NonNullable<T.ContractClientInfoResult>['phone']>, string>>; // ContractClientInfoResult.phone
export type Pin55 = Assert<Eq<NonNullable<NonNullable<T.ContractClientInfoResult>['eMail']>, string>>; // ContractClientInfoResult.eMail
export type Pin56 = Assert<Eq<NonNullable<NonNullable<T.ContractClientInfoResult>['client_code']>, string>>; // ContractClientInfoResult.client_code
export type Pin57 = Assert<Eq<NonNullable<NonNullable<T.ContractClientInfoResult>['client_country']>, string>>; // ContractClientInfoResult.client_country
export type Pin58 = Assert<Eq<NonNullable<NonNullable<T.ContractClientInfoResult>['client_countryID']>, string>>; // ContractClientInfoResult.client_countryID
export type Pin59 = Assert<Eq<NonNullable<NonNullable<T.ContractClientInfoResult>['client_region']>, string>>; // ContractClientInfoResult.client_region
export type Pin60 = Assert<Eq<NonNullable<NonNullable<T.ContractClientInfoResult>['client_regionID']>, string>>; // ContractClientInfoResult.client_regionID
export type Pin61 = Assert<Eq<NonNullable<NonNullable<T.ContractClientInfoResult>['client_area']>, string>>; // ContractClientInfoResult.client_area
export type Pin62 = Assert<Eq<NonNullable<NonNullable<T.ContractClientInfoResult>['client_areaID']>, string>>; // ContractClientInfoResult.client_areaID
export type Pin63 = Assert<Eq<NonNullable<NonNullable<T.ContractClientInfoResult>['client_street']>, string>>; // ContractClientInfoResult.client_street
export type Pin64 = Assert<Eq<NonNullable<NonNullable<T.ContractClientInfoResult>['client_streetID']>, string>>; // ContractClientInfoResult.client_streetID
export type Pin65 = Assert<Eq<NonNullable<NonNullable<T.ContractClientInfoResult>['client_cityID']>, string>>; // ContractClientInfoResult.client_cityID
export type Pin66 = Assert<Eq<NonNullable<NonNullable<T.ContractClientInfoResult>['client_city']>, string>>; // ContractClientInfoResult.client_city
export type Pin67 = Assert<Eq<NonNullable<NonNullable<T.ContractClientInfoResult>['client_building']>, string>>; // ContractClientInfoResult.client_building
export type Pin68 = Assert<Eq<NonNullable<NonNullable<T.ContractClientInfoResult>['client_flat']>, string>>; // ContractClientInfoResult.client_flat
export type Pin69 = Assert<Eq<NonNullable<NonNullable<T.ContractClientInfoResult>['client_postalCode']>, string>>; // ContractClientInfoResult.client_postalCode
export type Pin70 = Assert<Eq<NonNullable<NonNullable<T.ContractClientInfoResult>['client_mainCounterparty']>, string>>; // ContractClientInfoResult.client_mainCounterparty
export type Pin71 = Assert<
  Eq<NonNullable<NonNullable<T.ContractClientInfoResult>['client_mainCounterpartyID']>, string>
>; // ContractClientInfoResult.client_mainCounterpartyID
export type Pin72 = Assert<
  Eq<NonNullable<NonNullable<T.ContractClientInfoResult>['client_mainCounterparty_edrpou']>, string>
>; // ContractClientInfoResult.client_mainCounterparty_edrpou
export type Pin73 = Assert<
  Eq<NonNullable<NonNullable<T.ContractClientInfoResult>['client_mainCounterpartySel']>, string>
>; // ContractClientInfoResult.client_mainCounterpartySel
export type Pin74 = Assert<
  Eq<NonNullable<NonNullable<T.ContractClientInfoResult>['client_mainCounterpartySelID']>, string>
>; // ContractClientInfoResult.client_mainCounterpartySelID
export type Pin75 = Assert<Eq<NonNullable<NonNullable<T.ContractClientInfoResult>['contract_term']>, string>>; // ContractClientInfoResult.contract_term
export type Pin76 = Assert<Eq<NonNullable<NonNullable<T.ContractClientInfoResult>['ContractSupportManager']>, string>>; // ContractClientInfoResult.ContractSupportManager
export type Pin77 = Assert<
  Eq<NonNullable<NonNullable<T.ContractClientInfoResult>['ContractSupportManagerID']>, string>
>; // ContractClientInfoResult.ContractSupportManagerID
export type Pin78 = Assert<
  Eq<NonNullable<NonNullable<T.ContractClientInfoResult>['ContractAttractionManager']>, string>
>; // ContractClientInfoResult.ContractAttractionManager
export type Pin79 = Assert<
  Eq<NonNullable<NonNullable<T.ContractClientInfoResult>['ContractAttractionManagerID']>, string>
>; // ContractClientInfoResult.ContractAttractionManagerID
export type Pin80 = Assert<Eq<keyof NonNullable<T.ContractValidationCheckRequestBody>, 'ContractID' | 'AgentID'>>; // ContractValidationCheckRequestBody keys
export type Pin81 = Assert<Eq<Req<NonNullable<T.ContractValidationCheckRequestBody>>, 'ContractID'>>; // ContractValidationCheckRequestBody required
export type Pin82 = Assert<Eq<NonNullable<NonNullable<T.ContractValidationCheckRequestBody>['ContractID']>, string>>; // ContractValidationCheckRequestBody.ContractID
export type Pin83 = Assert<Eq<NonNullable<NonNullable<T.ContractValidationCheckRequestBody>['AgentID']>, string>>; // ContractValidationCheckRequestBody.AgentID
export type Pin84 = Assert<Eq<keyof NonNullable<T.ContractValidationCheckResult>, 'info' | 'result'>>; // ContractValidationCheckResult keys
export type Pin85 = Assert<Eq<Req<NonNullable<T.ContractValidationCheckResult>>, never>>; // ContractValidationCheckResult required
export type Pin86 = Assert<
  Eq<
    keyof NonNullable<NonNullable<T.ContractValidationCheckResult>['info']>,
    'fieldName' | 'message' | 'messageDetails'
  >
>; // ContractValidationCheckResult.info keys
export type Pin87 = Assert<Eq<Req<NonNullable<NonNullable<T.ContractValidationCheckResult>['info']>>, never>>; // ContractValidationCheckResult.info required
export type Pin88 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<T.ContractValidationCheckResult>['info']>['fieldName']>, string>
>; // ContractValidationCheckResult.info.fieldName
export type Pin89 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<T.ContractValidationCheckResult>['info']>['message']>, string>
>; // ContractValidationCheckResult.info.message
export type Pin90 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<T.ContractValidationCheckResult>['info']>['messageDetails']>, string>
>; // ContractValidationCheckResult.info.messageDetails
export type Pin91 = Assert<
  Eq<keyof NonNullable<NonNullable<T.ContractValidationCheckResult>['result']>, 'status' | 'text'>
>; // ContractValidationCheckResult.result keys
export type Pin92 = Assert<Eq<Req<NonNullable<NonNullable<T.ContractValidationCheckResult>['result']>>, never>>; // ContractValidationCheckResult.result required
export type Pin93 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<T.ContractValidationCheckResult>['result']>['status']>, string>
>; // ContractValidationCheckResult.result.status
export type Pin94 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<T.ContractValidationCheckResult>['result']>['text']>, string>
>; // ContractValidationCheckResult.result.text
export type Pin95 = Assert<Eq<keyof NonNullable<T.ParcelReturnNewRequestBody>, 'parcelID' | 'reasonID'>>; // ParcelReturnNewRequestBody keys
export type Pin96 = Assert<Eq<Req<NonNullable<T.ParcelReturnNewRequestBody>>, never>>; // ParcelReturnNewRequestBody required
export type Pin97 = Assert<Eq<NonNullable<NonNullable<T.ParcelReturnNewRequestBody>['parcelID']>, string>>; // ParcelReturnNewRequestBody.parcelID
export type Pin98 = Assert<Eq<NonNullable<NonNullable<T.ParcelReturnNewRequestBody>['reasonID']>, string>>; // ParcelReturnNewRequestBody.reasonID
export type Pin99 = Assert<
  Eq<keyof NonNullable<T.ParcelReturnNewResult>, 'do\u0441ID' | 'do\u0441IDref' | 'do\u0441Number'>
>; // ParcelReturnNewResult keys
export type Pin100 = Assert<Eq<Req<NonNullable<T.ParcelReturnNewResult>>, never>>; // ParcelReturnNewResult required
export type Pin101 = Assert<Eq<NonNullable<NonNullable<T.ParcelReturnNewResult>['do\u0441ID']>, string>>; // ParcelReturnNewResult.do\u0441ID
export type Pin102 = Assert<Eq<NonNullable<NonNullable<T.ParcelReturnNewResult>['do\u0441IDref']>, string>>; // ParcelReturnNewResult.do\u0441IDref
export type Pin103 = Assert<Eq<NonNullable<NonNullable<T.ParcelReturnNewResult>['do\u0441Number']>, string>>; // ParcelReturnNewResult.do\u0441Number
export type Pin104 = Assert<
  Eq<
    keyof NonNullable<NonNullable<T.ParcelReturnReasonsResult>[number]>,
    'name' | 'nameUA' | 'nameRU' | 'nameEN' | 'uuid'
  >
>; // ParcelReturnReasonsResult[] keys
export type Pin105 = Assert<Eq<Req<NonNullable<NonNullable<T.ParcelReturnReasonsResult>[number]>>, never>>; // ParcelReturnReasonsResult[] required
export type Pin106 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<T.ParcelReturnReasonsResult>[number]>['name']>, string>
>; // ParcelReturnReasonsResult[].name
export type Pin107 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<T.ParcelReturnReasonsResult>[number]>['nameUA']>, string>
>; // ParcelReturnReasonsResult[].nameUA
export type Pin108 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<T.ParcelReturnReasonsResult>[number]>['nameRU']>, string>
>; // ParcelReturnReasonsResult[].nameRU
export type Pin109 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<T.ParcelReturnReasonsResult>[number]>['nameEN']>, string>
>; // ParcelReturnReasonsResult[].nameEN
export type Pin110 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<T.ParcelReturnReasonsResult>[number]>['uuid']>, string>
>; // ParcelReturnReasonsResult[].uuid
export type Pin111 = Assert<
  Eq<
    keyof NonNullable<T.CalculateRequestBody>,
    'sendingDate' | 'contractID' | 'COD' | 'promocode' | 'sender' | 'receiver' | 'specConditionsItems' | 'placesItems'
  >
>; // CalculateRequestBody keys
export type Pin112 = Assert<Eq<Req<NonNullable<T.CalculateRequestBody>>, never>>; // CalculateRequestBody required
export type Pin113 = Assert<Eq<NonNullable<NonNullable<T.CalculateRequestBody>['sendingDate']>, string>>; // CalculateRequestBody.sendingDate
export type Pin114 = Assert<Eq<NonNullable<NonNullable<T.CalculateRequestBody>['contractID']>, string>>; // CalculateRequestBody.contractID
export type Pin115 = Assert<Eq<NonNullable<NonNullable<T.CalculateRequestBody>['COD']>, number>>; // CalculateRequestBody.COD
export type Pin116 = Assert<Eq<NonNullable<NonNullable<T.CalculateRequestBody>['promocode']>, string>>; // CalculateRequestBody.promocode
export type Pin117 = Assert<
  Eq<keyof NonNullable<NonNullable<T.CalculateRequestBody>['sender']>, 'branchID' | 'cityID' | 'floor' | 'service'>
>; // CalculateRequestBody.sender keys
export type Pin118 = Assert<
  Eq<Req<NonNullable<NonNullable<T.CalculateRequestBody>['sender']>>, 'branchID' | 'cityID' | 'service'>
>; // CalculateRequestBody.sender required
export type Pin119 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<T.CalculateRequestBody>['sender']>['branchID']>, string>
>; // CalculateRequestBody.sender.branchID
export type Pin120 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<T.CalculateRequestBody>['sender']>['cityID']>, string>
>; // CalculateRequestBody.sender.cityID
export type Pin121 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<T.CalculateRequestBody>['sender']>['floor']>, number>
>; // CalculateRequestBody.sender.floor
export type Pin122 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<T.CalculateRequestBody>['sender']>['service']>, string>
>; // CalculateRequestBody.sender.service
export type Pin123 = Assert<
  Eq<
    keyof NonNullable<NonNullable<T.CalculateRequestBody>['receiver']>,
    'countryID' | 'branchID' | 'cityID' | 'floor' | 'service'
  >
>; // CalculateRequestBody.receiver keys
export type Pin124 = Assert<
  Eq<Req<NonNullable<NonNullable<T.CalculateRequestBody>['receiver']>>, 'branchID' | 'cityID' | 'service'>
>; // CalculateRequestBody.receiver required
export type Pin125 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<T.CalculateRequestBody>['receiver']>['countryID']>, string>
>; // CalculateRequestBody.receiver.countryID
export type Pin126 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<T.CalculateRequestBody>['receiver']>['branchID']>, string>
>; // CalculateRequestBody.receiver.branchID
export type Pin127 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<T.CalculateRequestBody>['receiver']>['cityID']>, string>
>; // CalculateRequestBody.receiver.cityID
export type Pin128 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<T.CalculateRequestBody>['receiver']>['floor']>, number>
>; // CalculateRequestBody.receiver.floor
export type Pin129 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<T.CalculateRequestBody>['receiver']>['service']>, string>
>; // CalculateRequestBody.receiver.service
export type Pin130 = Assert<
  Eq<keyof NonNullable<NonNullable<NonNullable<T.CalculateRequestBody>['specConditionsItems']>[number]>, 'conditionID'>
>; // CalculateRequestBody.specConditionsItems[] keys
export type Pin131 = Assert<
  Eq<Req<NonNullable<NonNullable<NonNullable<T.CalculateRequestBody>['specConditionsItems']>[number]>>, never>
>; // CalculateRequestBody.specConditionsItems[] required
export type Pin132 = Assert<
  Eq<
    NonNullable<
      NonNullable<NonNullable<NonNullable<T.CalculateRequestBody>['specConditionsItems']>[number]>['conditionID']
    >,
    string
  >
>; // CalculateRequestBody.specConditionsItems[].conditionID
export type Pin133 = Assert<
  Eq<
    keyof NonNullable<NonNullable<NonNullable<T.CalculateRequestBody>['placesItems']>[number]>,
    'quantity' | 'weight' | 'volume' | 'insurance' | 'length' | 'width' | 'height' | 'wheels'
  >
>; // CalculateRequestBody.placesItems[] keys
export type Pin134 = Assert<
  Eq<Req<NonNullable<NonNullable<NonNullable<T.CalculateRequestBody>['placesItems']>[number]>>, 'quantity' | 'weight'>
>; // CalculateRequestBody.placesItems[] required
export type Pin135 = Assert<
  Eq<
    NonNullable<NonNullable<NonNullable<NonNullable<T.CalculateRequestBody>['placesItems']>[number]>['quantity']>,
    number
  >
>; // CalculateRequestBody.placesItems[].quantity
export type Pin136 = Assert<
  Eq<
    NonNullable<NonNullable<NonNullable<NonNullable<T.CalculateRequestBody>['placesItems']>[number]>['weight']>,
    number
  >
>; // CalculateRequestBody.placesItems[].weight
export type Pin137 = Assert<
  Eq<
    NonNullable<NonNullable<NonNullable<NonNullable<T.CalculateRequestBody>['placesItems']>[number]>['volume']>,
    number
  >
>; // CalculateRequestBody.placesItems[].volume
export type Pin138 = Assert<
  Eq<
    NonNullable<NonNullable<NonNullable<NonNullable<T.CalculateRequestBody>['placesItems']>[number]>['insurance']>,
    number
  >
>; // CalculateRequestBody.placesItems[].insurance
export type Pin139 = Assert<
  Eq<
    NonNullable<NonNullable<NonNullable<NonNullable<T.CalculateRequestBody>['placesItems']>[number]>['length']>,
    number
  >
>; // CalculateRequestBody.placesItems[].length
export type Pin140 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<NonNullable<T.CalculateRequestBody>['placesItems']>[number]>['width']>, number>
>; // CalculateRequestBody.placesItems[].width
export type Pin141 = Assert<
  Eq<
    NonNullable<NonNullable<NonNullable<NonNullable<T.CalculateRequestBody>['placesItems']>[number]>['height']>,
    number
  >
>; // CalculateRequestBody.placesItems[].height
export type Pin142 = Assert<
  Eq<
    NonNullable<NonNullable<NonNullable<NonNullable<T.CalculateRequestBody>['placesItems']>[number]>['wheels']>,
    string
  >
>; // CalculateRequestBody.placesItems[].wheels
export type Pin143 = Assert<
  Eq<
    keyof NonNullable<NonNullable<T.CalculateResult>[number]>,
    'costServices' | 'estimatedDeliveryDate' | 'possibleDeliveryDates'
  >
>; // CalculateResult[] keys
export type Pin144 = Assert<Eq<Req<NonNullable<NonNullable<T.CalculateResult>[number]>>, never>>; // CalculateResult[] required
export type Pin145 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<T.CalculateResult>[number]>['costServices']>, string>
>; // CalculateResult[].costServices
export type Pin146 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<T.CalculateResult>[number]>['estimatedDeliveryDate']>, string>
>; // CalculateResult[].estimatedDeliveryDate
export type Pin147 = Assert<
  Eq<
    keyof NonNullable<
      NonNullable<NonNullable<NonNullable<T.CalculateResult>[number]>['possibleDeliveryDates']>[number]
    >,
    'deliveryDate'
  >
>; // CalculateResult[].possibleDeliveryDates[] keys
export type Pin148 = Assert<
  Eq<
    Req<NonNullable<NonNullable<NonNullable<NonNullable<T.CalculateResult>[number]>['possibleDeliveryDates']>[number]>>,
    never
  >
>; // CalculateResult[].possibleDeliveryDates[] required
export type Pin149 = Assert<
  Eq<
    NonNullable<
      NonNullable<
        NonNullable<NonNullable<NonNullable<T.CalculateResult>[number]>['possibleDeliveryDates']>[number]
      >['deliveryDate']
    >,
    string
  >
>; // CalculateResult[].possibleDeliveryDates[].deliveryDate
export type Pin150 = Assert<
  Eq<
    keyof NonNullable<T.CalculateExportB2CRequestBody>,
    'receiver' | 'ioss' | 'contractID' | 'sendingDate' | 'placesItems'
  >
>; // CalculateExportB2CRequestBody keys
export type Pin151 = Assert<Eq<Req<NonNullable<T.CalculateExportB2CRequestBody>>, never>>; // CalculateExportB2CRequestBody required
export type Pin152 = Assert<
  Eq<
    keyof NonNullable<NonNullable<T.CalculateExportB2CRequestBody>['receiver']>,
    'service' | 'countryID' | 'regionID' | 'cityID'
  >
>; // CalculateExportB2CRequestBody.receiver keys
export type Pin153 = Assert<
  Eq<Req<NonNullable<NonNullable<T.CalculateExportB2CRequestBody>['receiver']>>, 'countryID'>
>; // CalculateExportB2CRequestBody.receiver required
export type Pin154 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<T.CalculateExportB2CRequestBody>['receiver']>['service']>, string>
>; // CalculateExportB2CRequestBody.receiver.service
export type Pin155 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<T.CalculateExportB2CRequestBody>['receiver']>['countryID']>, string>
>; // CalculateExportB2CRequestBody.receiver.countryID
export type Pin156 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<T.CalculateExportB2CRequestBody>['receiver']>['regionID']>, string>
>; // CalculateExportB2CRequestBody.receiver.regionID
export type Pin157 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<T.CalculateExportB2CRequestBody>['receiver']>['cityID']>, string>
>; // CalculateExportB2CRequestBody.receiver.cityID
export type Pin158 = Assert<Eq<NonNullable<NonNullable<T.CalculateExportB2CRequestBody>['ioss']>, boolean>>; // CalculateExportB2CRequestBody.ioss
export type Pin159 = Assert<Eq<NonNullable<NonNullable<T.CalculateExportB2CRequestBody>['contractID']>, string>>; // CalculateExportB2CRequestBody.contractID
export type Pin160 = Assert<Eq<NonNullable<NonNullable<T.CalculateExportB2CRequestBody>['sendingDate']>, string>>; // CalculateExportB2CRequestBody.sendingDate
export type Pin161 = Assert<
  Eq<
    keyof NonNullable<NonNullable<NonNullable<T.CalculateExportB2CRequestBody>['placesItems']>[number]>,
    | 'quantity'
    | 'placeWeight'
    | 'weight'
    | 'placeVolume'
    | 'volume'
    | 'insurance'
    | 'length'
    | 'width'
    | 'height'
    | 'formatID'
  >
>; // CalculateExportB2CRequestBody.placesItems[] keys
export type Pin162 = Assert<
  Eq<Req<NonNullable<NonNullable<NonNullable<T.CalculateExportB2CRequestBody>['placesItems']>[number]>>, never>
>; // CalculateExportB2CRequestBody.placesItems[] required
export type Pin163 = Assert<
  Eq<
    NonNullable<
      NonNullable<NonNullable<NonNullable<T.CalculateExportB2CRequestBody>['placesItems']>[number]>['quantity']
    >,
    number
  >
>; // CalculateExportB2CRequestBody.placesItems[].quantity
export type Pin164 = Assert<
  Eq<
    NonNullable<
      NonNullable<NonNullable<NonNullable<T.CalculateExportB2CRequestBody>['placesItems']>[number]>['placeWeight']
    >,
    number
  >
>; // CalculateExportB2CRequestBody.placesItems[].placeWeight
export type Pin165 = Assert<
  Eq<
    NonNullable<
      NonNullable<NonNullable<NonNullable<T.CalculateExportB2CRequestBody>['placesItems']>[number]>['weight']
    >,
    number
  >
>; // CalculateExportB2CRequestBody.placesItems[].weight
export type Pin166 = Assert<
  Eq<
    NonNullable<
      NonNullable<NonNullable<NonNullable<T.CalculateExportB2CRequestBody>['placesItems']>[number]>['placeVolume']
    >,
    number
  >
>; // CalculateExportB2CRequestBody.placesItems[].placeVolume
export type Pin167 = Assert<
  Eq<
    NonNullable<
      NonNullable<NonNullable<NonNullable<T.CalculateExportB2CRequestBody>['placesItems']>[number]>['volume']
    >,
    number
  >
>; // CalculateExportB2CRequestBody.placesItems[].volume
export type Pin168 = Assert<
  Eq<
    NonNullable<
      NonNullable<NonNullable<NonNullable<T.CalculateExportB2CRequestBody>['placesItems']>[number]>['insurance']
    >,
    number
  >
>; // CalculateExportB2CRequestBody.placesItems[].insurance
export type Pin169 = Assert<
  Eq<
    NonNullable<
      NonNullable<NonNullable<NonNullable<T.CalculateExportB2CRequestBody>['placesItems']>[number]>['length']
    >,
    number
  >
>; // CalculateExportB2CRequestBody.placesItems[].length
export type Pin170 = Assert<
  Eq<
    NonNullable<NonNullable<NonNullable<NonNullable<T.CalculateExportB2CRequestBody>['placesItems']>[number]>['width']>,
    number
  >
>; // CalculateExportB2CRequestBody.placesItems[].width
export type Pin171 = Assert<
  Eq<
    NonNullable<
      NonNullable<NonNullable<NonNullable<T.CalculateExportB2CRequestBody>['placesItems']>[number]>['height']
    >,
    number
  >
>; // CalculateExportB2CRequestBody.placesItems[].height
export type Pin172 = Assert<
  Eq<
    NonNullable<
      NonNullable<NonNullable<NonNullable<T.CalculateExportB2CRequestBody>['placesItems']>[number]>['formatID']
    >,
    string
  >
>; // CalculateExportB2CRequestBody.placesItems[].formatID
export type Pin173 = Assert<
  Eq<
    keyof NonNullable<T.CalculateExportB2CResult>,
    | 'Success'
    | 'Message'
    | 'Tariff'
    | 'Currency'
    | 'CurrencyName'
    | 'PriceSource'
    | 'Formula'
    | 'CountryGUID'
    | 'CountryCode'
    | 'CountryName'
    | 'CityGUID'
    | 'CityCode'
    | 'CityName'
    | 'AgentGUID'
    | 'AgentCode'
    | 'AgentName'
    | 'ContractGUID'
    | 'ContractCode'
    | 'ContractName'
    | 'ServiceType'
    | 'ServiceTypeName'
    | 'PlacesCount'
    | 'InputWeight'
    | 'InputVolumeCm'
    | 'InputVolumeM3'
    | 'InputLengthCm'
    | 'InputWidthCm'
    | 'InputHeightCm'
    | 'VolumeCalculatedByDimensions'
    | 'VolumeWeight'
    | 'CalculatedWeight'
    | 'UsedVolumeWeight'
    | 'IOSS'
    | 'CalculationDate'
    | 'CalculationDateFormatted'
    | 'PriceDependsOnCity'
    | 'UsedCityTariff'
    | 'UsedAgentTariff'
    | 'UsedDefaultTariff'
    | 'RegionGUID'
    | 'RegionName'
    | 'ZoneGUID'
    | 'ZoneName'
    | 'UsedZoneTariff'
  >
>; // CalculateExportB2CResult keys
export type Pin174 = Assert<Eq<Req<NonNullable<T.CalculateExportB2CResult>>, never>>; // CalculateExportB2CResult required
export type Pin175 = Assert<Eq<NonNullable<NonNullable<T.CalculateExportB2CResult>['Success']>, boolean>>; // CalculateExportB2CResult.Success
export type Pin176 = Assert<Eq<NonNullable<NonNullable<T.CalculateExportB2CResult>['Message']>, string>>; // CalculateExportB2CResult.Message
export type Pin177 = Assert<Eq<NonNullable<NonNullable<T.CalculateExportB2CResult>['Tariff']>, number>>; // CalculateExportB2CResult.Tariff
export type Pin178 = Assert<Eq<NonNullable<NonNullable<T.CalculateExportB2CResult>['Currency']>, string>>; // CalculateExportB2CResult.Currency
export type Pin179 = Assert<Eq<NonNullable<NonNullable<T.CalculateExportB2CResult>['CurrencyName']>, string>>; // CalculateExportB2CResult.CurrencyName
export type Pin180 = Assert<Eq<NonNullable<NonNullable<T.CalculateExportB2CResult>['PriceSource']>, string>>; // CalculateExportB2CResult.PriceSource
export type Pin181 = Assert<Eq<NonNullable<NonNullable<T.CalculateExportB2CResult>['Formula']>, string>>; // CalculateExportB2CResult.Formula
export type Pin182 = Assert<Eq<NonNullable<NonNullable<T.CalculateExportB2CResult>['CountryGUID']>, string>>; // CalculateExportB2CResult.CountryGUID
export type Pin183 = Assert<Eq<NonNullable<NonNullable<T.CalculateExportB2CResult>['CountryCode']>, number>>; // CalculateExportB2CResult.CountryCode
export type Pin184 = Assert<Eq<NonNullable<NonNullable<T.CalculateExportB2CResult>['CountryName']>, string>>; // CalculateExportB2CResult.CountryName
export type Pin185 = Assert<Eq<NonNullable<NonNullable<T.CalculateExportB2CResult>['CityGUID']>, string>>; // CalculateExportB2CResult.CityGUID
export type Pin186 = Assert<Eq<NonNullable<NonNullable<T.CalculateExportB2CResult>['CityCode']>, string>>; // CalculateExportB2CResult.CityCode
export type Pin187 = Assert<Eq<NonNullable<NonNullable<T.CalculateExportB2CResult>['CityName']>, string>>; // CalculateExportB2CResult.CityName
export type Pin188 = Assert<Eq<NonNullable<NonNullable<T.CalculateExportB2CResult>['AgentGUID']>, string>>; // CalculateExportB2CResult.AgentGUID
export type Pin189 = Assert<Eq<NonNullable<NonNullable<T.CalculateExportB2CResult>['AgentCode']>, string>>; // CalculateExportB2CResult.AgentCode
export type Pin190 = Assert<Eq<NonNullable<NonNullable<T.CalculateExportB2CResult>['AgentName']>, string>>; // CalculateExportB2CResult.AgentName
export type Pin191 = Assert<Eq<NonNullable<NonNullable<T.CalculateExportB2CResult>['ContractGUID']>, string>>; // CalculateExportB2CResult.ContractGUID
export type Pin192 = Assert<Eq<NonNullable<NonNullable<T.CalculateExportB2CResult>['ContractCode']>, string>>; // CalculateExportB2CResult.ContractCode
export type Pin193 = Assert<Eq<NonNullable<NonNullable<T.CalculateExportB2CResult>['ContractName']>, string>>; // CalculateExportB2CResult.ContractName
export type Pin194 = Assert<Eq<NonNullable<NonNullable<T.CalculateExportB2CResult>['ServiceType']>, string>>; // CalculateExportB2CResult.ServiceType
export type Pin195 = Assert<Eq<NonNullable<NonNullable<T.CalculateExportB2CResult>['ServiceTypeName']>, string>>; // CalculateExportB2CResult.ServiceTypeName
export type Pin196 = Assert<Eq<NonNullable<NonNullable<T.CalculateExportB2CResult>['PlacesCount']>, number>>; // CalculateExportB2CResult.PlacesCount
export type Pin197 = Assert<Eq<NonNullable<NonNullable<T.CalculateExportB2CResult>['InputWeight']>, number>>; // CalculateExportB2CResult.InputWeight
export type Pin198 = Assert<Eq<NonNullable<NonNullable<T.CalculateExportB2CResult>['InputVolumeCm']>, number>>; // CalculateExportB2CResult.InputVolumeCm
export type Pin199 = Assert<Eq<NonNullable<NonNullable<T.CalculateExportB2CResult>['InputVolumeM3']>, number>>; // CalculateExportB2CResult.InputVolumeM3
export type Pin200 = Assert<Eq<NonNullable<NonNullable<T.CalculateExportB2CResult>['InputLengthCm']>, number>>; // CalculateExportB2CResult.InputLengthCm
export type Pin201 = Assert<Eq<NonNullable<NonNullable<T.CalculateExportB2CResult>['InputWidthCm']>, number>>; // CalculateExportB2CResult.InputWidthCm
export type Pin202 = Assert<Eq<NonNullable<NonNullable<T.CalculateExportB2CResult>['InputHeightCm']>, number>>; // CalculateExportB2CResult.InputHeightCm
export type Pin203 = Assert<
  Eq<NonNullable<NonNullable<T.CalculateExportB2CResult>['VolumeCalculatedByDimensions']>, boolean>
>; // CalculateExportB2CResult.VolumeCalculatedByDimensions
export type Pin204 = Assert<Eq<NonNullable<NonNullable<T.CalculateExportB2CResult>['VolumeWeight']>, number>>; // CalculateExportB2CResult.VolumeWeight
export type Pin205 = Assert<Eq<NonNullable<NonNullable<T.CalculateExportB2CResult>['CalculatedWeight']>, number>>; // CalculateExportB2CResult.CalculatedWeight
export type Pin206 = Assert<Eq<NonNullable<NonNullable<T.CalculateExportB2CResult>['UsedVolumeWeight']>, boolean>>; // CalculateExportB2CResult.UsedVolumeWeight
export type Pin207 = Assert<Eq<NonNullable<NonNullable<T.CalculateExportB2CResult>['IOSS']>, string>>; // CalculateExportB2CResult.IOSS
export type Pin208 = Assert<Eq<NonNullable<NonNullable<T.CalculateExportB2CResult>['CalculationDate']>, string>>; // CalculateExportB2CResult.CalculationDate
export type Pin209 = Assert<
  Eq<NonNullable<NonNullable<T.CalculateExportB2CResult>['CalculationDateFormatted']>, string>
>; // CalculateExportB2CResult.CalculationDateFormatted
export type Pin210 = Assert<Eq<NonNullable<NonNullable<T.CalculateExportB2CResult>['PriceDependsOnCity']>, boolean>>; // CalculateExportB2CResult.PriceDependsOnCity
export type Pin211 = Assert<Eq<NonNullable<NonNullable<T.CalculateExportB2CResult>['UsedCityTariff']>, boolean>>; // CalculateExportB2CResult.UsedCityTariff
export type Pin212 = Assert<Eq<NonNullable<NonNullable<T.CalculateExportB2CResult>['UsedAgentTariff']>, boolean>>; // CalculateExportB2CResult.UsedAgentTariff
export type Pin213 = Assert<Eq<NonNullable<NonNullable<T.CalculateExportB2CResult>['UsedDefaultTariff']>, boolean>>; // CalculateExportB2CResult.UsedDefaultTariff
export type Pin214 = Assert<Eq<NonNullable<NonNullable<T.CalculateExportB2CResult>['RegionGUID']>, string>>; // CalculateExportB2CResult.RegionGUID
export type Pin215 = Assert<Eq<NonNullable<NonNullable<T.CalculateExportB2CResult>['RegionName']>, string>>; // CalculateExportB2CResult.RegionName
export type Pin216 = Assert<Eq<NonNullable<NonNullable<T.CalculateExportB2CResult>['ZoneGUID']>, string>>; // CalculateExportB2CResult.ZoneGUID
export type Pin217 = Assert<Eq<NonNullable<NonNullable<T.CalculateExportB2CResult>['ZoneName']>, string>>; // CalculateExportB2CResult.ZoneName
export type Pin218 = Assert<Eq<NonNullable<NonNullable<T.CalculateExportB2CResult>['UsedZoneTariff']>, boolean>>; // CalculateExportB2CResult.UsedZoneTariff
export type Pin219 = Assert<
  Eq<
    keyof NonNullable<T.ChangingParcelBySenderRequestBody>,
    'parcelID' | 'senderPhone' | 'reciever' | 'recieverPhone' | 'COD' | 'NumberCardForCOD'
  >
>; // ChangingParcelBySenderRequestBody keys
export type Pin220 = Assert<Eq<Req<NonNullable<T.ChangingParcelBySenderRequestBody>>, never>>; // ChangingParcelBySenderRequestBody required
export type Pin221 = Assert<Eq<NonNullable<NonNullable<T.ChangingParcelBySenderRequestBody>['parcelID']>, string>>; // ChangingParcelBySenderRequestBody.parcelID
export type Pin222 = Assert<Eq<NonNullable<NonNullable<T.ChangingParcelBySenderRequestBody>['senderPhone']>, string>>; // ChangingParcelBySenderRequestBody.senderPhone
export type Pin223 = Assert<Eq<NonNullable<NonNullable<T.ChangingParcelBySenderRequestBody>['reciever']>, string>>; // ChangingParcelBySenderRequestBody.reciever
export type Pin224 = Assert<Eq<NonNullable<NonNullable<T.ChangingParcelBySenderRequestBody>['recieverPhone']>, string>>; // ChangingParcelBySenderRequestBody.recieverPhone
export type Pin225 = Assert<Eq<NonNullable<NonNullable<T.ChangingParcelBySenderRequestBody>['COD']>, number>>; // ChangingParcelBySenderRequestBody.COD
export type Pin226 = Assert<
  Eq<NonNullable<NonNullable<T.ChangingParcelBySenderRequestBody>['NumberCardForCOD']>, string>
>; // ChangingParcelBySenderRequestBody.NumberCardForCOD
export type Pin227 = Assert<
  Eq<keyof NonNullable<T.ChangingParcelBySenderResult>, 'Success' | 'DocuentNumber' | 'SMS_sended'>
>; // ChangingParcelBySenderResult keys
export type Pin228 = Assert<Eq<Req<NonNullable<T.ChangingParcelBySenderResult>>, never>>; // ChangingParcelBySenderResult required
export type Pin229 = Assert<Eq<NonNullable<NonNullable<T.ChangingParcelBySenderResult>['Success']>, boolean>>; // ChangingParcelBySenderResult.Success
export type Pin230 = Assert<Eq<NonNullable<NonNullable<T.ChangingParcelBySenderResult>['DocuentNumber']>, string>>; // ChangingParcelBySenderResult.DocuentNumber
export type Pin231 = Assert<Eq<NonNullable<NonNullable<T.ChangingParcelBySenderResult>['SMS_sended']>, boolean>>; // ChangingParcelBySenderResult.SMS_sended
export type Pin232 = Assert<Eq<keyof T.GetParcelPathParams, 'parcelID' | 'searchMode' | 'returnMode'>>; // GetParcelPathParams keys
export type Pin233 = Assert<Eq<Req<T.GetParcelPathParams>, 'parcelID' | 'searchMode' | 'returnMode'>>; // GetParcelPathParams required
export type Pin234 = Assert<Eq<NonNullable<T.GetParcelPathParams['parcelID']>, string>>; // GetParcelPathParams.parcelID
export type Pin235 = Assert<Eq<NonNullable<T.GetParcelPathParams['searchMode']>, string>>; // GetParcelPathParams.searchMode
export type Pin236 = Assert<Eq<NonNullable<T.GetParcelPathParams['returnMode']>, string>>; // GetParcelPathParams.returnMode
export type Pin237 = Assert<
  Eq<
    keyof NonNullable<T.GetParcelResult>,
    | 'parcelNumber'
    | 'subAgent'
    | 'agent'
    | 'notation'
    | 'payType'
    | 'receiverPay'
    | 'COD'
    | 'weight'
    | 'pudoID'
    | 'pudoPointType'
    | 'expectedDeliveryDate'
    | 'sender'
    | 'receiver'
    | 'placesItems'
    | 'specConditionsItems'
    | 'contentsItems'
    | 'codPaymentItems'
    | 'goods'
    | 'deliveryOptions'
    | 'cardForCOD'
    | 'return'
  >
>; // GetParcelResult keys
export type Pin238 = Assert<Eq<Req<NonNullable<T.GetParcelResult>>, never>>; // GetParcelResult required
export type Pin239 = Assert<Eq<NonNullable<NonNullable<T.GetParcelResult>['parcelNumber']>, string>>; // GetParcelResult.parcelNumber
export type Pin240 = Assert<Eq<NonNullable<NonNullable<T.GetParcelResult>['subAgent']>, string>>; // GetParcelResult.subAgent
export type Pin241 = Assert<Eq<NonNullable<NonNullable<T.GetParcelResult>['agent']>, string>>; // GetParcelResult.agent
export type Pin242 = Assert<Eq<NonNullable<NonNullable<T.GetParcelResult>['notation']>, string>>; // GetParcelResult.notation
export type Pin243 = Assert<Eq<NonNullable<NonNullable<T.GetParcelResult>['payType']>, string>>; // GetParcelResult.payType
export type Pin244 = Assert<Eq<NonNullable<NonNullable<T.GetParcelResult>['receiverPay']>, string>>; // GetParcelResult.receiverPay
export type Pin245 = Assert<Eq<NonNullable<NonNullable<T.GetParcelResult>['COD']>, string>>; // GetParcelResult.COD
export type Pin246 = Assert<Eq<NonNullable<NonNullable<T.GetParcelResult>['weight']>, string>>; // GetParcelResult.weight
export type Pin247 = Assert<Eq<NonNullable<NonNullable<T.GetParcelResult>['pudoID']>, string>>; // GetParcelResult.pudoID
export type Pin248 = Assert<Eq<NonNullable<NonNullable<T.GetParcelResult>['pudoPointType']>, string>>; // GetParcelResult.pudoPointType
export type Pin249 = Assert<Eq<NonNullable<NonNullable<T.GetParcelResult>['expectedDeliveryDate']>, string>>; // GetParcelResult.expectedDeliveryDate
export type Pin250 = Assert<
  Eq<
    keyof NonNullable<NonNullable<T.GetParcelResult>['sender']>,
    'name' | 'phone' | 'zipCode' | 'branchID' | 'addressID' | 'building' | 'flat' | 'floor' | 'service'
  >
>; // GetParcelResult.sender keys
export type Pin251 = Assert<Eq<Req<NonNullable<NonNullable<T.GetParcelResult>['sender']>>, never>>; // GetParcelResult.sender required
export type Pin252 = Assert<Eq<NonNullable<NonNullable<NonNullable<T.GetParcelResult>['sender']>['name']>, string>>; // GetParcelResult.sender.name
export type Pin253 = Assert<Eq<NonNullable<NonNullable<NonNullable<T.GetParcelResult>['sender']>['phone']>, string>>; // GetParcelResult.sender.phone
export type Pin254 = Assert<Eq<NonNullable<NonNullable<NonNullable<T.GetParcelResult>['sender']>['zipCode']>, string>>; // GetParcelResult.sender.zipCode
export type Pin255 = Assert<Eq<NonNullable<NonNullable<NonNullable<T.GetParcelResult>['sender']>['branchID']>, string>>; // GetParcelResult.sender.branchID
export type Pin256 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<T.GetParcelResult>['sender']>['addressID']>, string>
>; // GetParcelResult.sender.addressID
export type Pin257 = Assert<Eq<NonNullable<NonNullable<NonNullable<T.GetParcelResult>['sender']>['building']>, string>>; // GetParcelResult.sender.building
export type Pin258 = Assert<Eq<NonNullable<NonNullable<NonNullable<T.GetParcelResult>['sender']>['flat']>, string>>; // GetParcelResult.sender.flat
export type Pin259 = Assert<Eq<NonNullable<NonNullable<NonNullable<T.GetParcelResult>['sender']>['floor']>, string>>; // GetParcelResult.sender.floor
export type Pin260 = Assert<Eq<NonNullable<NonNullable<NonNullable<T.GetParcelResult>['sender']>['service']>, string>>; // GetParcelResult.sender.service
export type Pin261 = Assert<
  Eq<
    keyof NonNullable<NonNullable<T.GetParcelResult>['receiver']>,
    'name' | 'phone' | 'zipCode' | 'branchID' | 'addressID' | 'building' | 'flat' | 'floor' | 'service'
  >
>; // GetParcelResult.receiver keys
export type Pin262 = Assert<Eq<Req<NonNullable<NonNullable<T.GetParcelResult>['receiver']>>, never>>; // GetParcelResult.receiver required
export type Pin263 = Assert<Eq<NonNullable<NonNullable<NonNullable<T.GetParcelResult>['receiver']>['name']>, string>>; // GetParcelResult.receiver.name
export type Pin264 = Assert<Eq<NonNullable<NonNullable<NonNullable<T.GetParcelResult>['receiver']>['phone']>, string>>; // GetParcelResult.receiver.phone
export type Pin265 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<T.GetParcelResult>['receiver']>['zipCode']>, string>
>; // GetParcelResult.receiver.zipCode
export type Pin266 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<T.GetParcelResult>['receiver']>['branchID']>, string>
>; // GetParcelResult.receiver.branchID
export type Pin267 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<T.GetParcelResult>['receiver']>['addressID']>, string>
>; // GetParcelResult.receiver.addressID
export type Pin268 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<T.GetParcelResult>['receiver']>['building']>, string>
>; // GetParcelResult.receiver.building
export type Pin269 = Assert<Eq<NonNullable<NonNullable<NonNullable<T.GetParcelResult>['receiver']>['flat']>, string>>; // GetParcelResult.receiver.flat
export type Pin270 = Assert<Eq<NonNullable<NonNullable<NonNullable<T.GetParcelResult>['receiver']>['floor']>, string>>; // GetParcelResult.receiver.floor
export type Pin271 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<T.GetParcelResult>['receiver']>['service']>, string>
>; // GetParcelResult.receiver.service
export type Pin272 = Assert<
  Eq<
    keyof NonNullable<NonNullable<NonNullable<T.GetParcelResult>['placesItems']>[number]>,
    'quantity' | 'weight' | 'volume' | 'insurance' | 'packID' | 'length' | 'width' | 'height' | 'wheels' | 'size'
  >
>; // GetParcelResult.placesItems[] keys
export type Pin273 = Assert<
  Eq<Req<NonNullable<NonNullable<NonNullable<T.GetParcelResult>['placesItems']>[number]>>, never>
>; // GetParcelResult.placesItems[] required
export type Pin274 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<NonNullable<T.GetParcelResult>['placesItems']>[number]>['quantity']>, string>
>; // GetParcelResult.placesItems[].quantity
export type Pin275 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<NonNullable<T.GetParcelResult>['placesItems']>[number]>['weight']>, string>
>; // GetParcelResult.placesItems[].weight
export type Pin276 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<NonNullable<T.GetParcelResult>['placesItems']>[number]>['volume']>, string>
>; // GetParcelResult.placesItems[].volume
export type Pin277 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<NonNullable<T.GetParcelResult>['placesItems']>[number]>['insurance']>, string>
>; // GetParcelResult.placesItems[].insurance
export type Pin278 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<NonNullable<T.GetParcelResult>['placesItems']>[number]>['packID']>, string>
>; // GetParcelResult.placesItems[].packID
export type Pin279 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<NonNullable<T.GetParcelResult>['placesItems']>[number]>['length']>, string>
>; // GetParcelResult.placesItems[].length
export type Pin280 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<NonNullable<T.GetParcelResult>['placesItems']>[number]>['width']>, string>
>; // GetParcelResult.placesItems[].width
export type Pin281 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<NonNullable<T.GetParcelResult>['placesItems']>[number]>['height']>, string>
>; // GetParcelResult.placesItems[].height
export type Pin282 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<NonNullable<T.GetParcelResult>['placesItems']>[number]>['wheels']>, string>
>; // GetParcelResult.placesItems[].wheels
export type Pin283 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<NonNullable<T.GetParcelResult>['placesItems']>[number]>['size']>, string>
>; // GetParcelResult.placesItems[].size
export type Pin284 = Assert<
  Eq<keyof NonNullable<NonNullable<NonNullable<T.GetParcelResult>['specConditionsItems']>[number]>, 'conditionID'>
>; // GetParcelResult.specConditionsItems[] keys
export type Pin285 = Assert<
  Eq<Req<NonNullable<NonNullable<NonNullable<T.GetParcelResult>['specConditionsItems']>[number]>>, never>
>; // GetParcelResult.specConditionsItems[] required
export type Pin286 = Assert<
  Eq<
    NonNullable<NonNullable<NonNullable<NonNullable<T.GetParcelResult>['specConditionsItems']>[number]>['conditionID']>,
    string
  >
>; // GetParcelResult.specConditionsItems[].conditionID
export type Pin287 = Assert<
  Eq<
    keyof NonNullable<NonNullable<NonNullable<T.GetParcelResult>['contentsItems']>[number]>,
    'contentName' | 'quantity' | 'weight' | 'value' | 'customsCode' | 'country'
  >
>; // GetParcelResult.contentsItems[] keys
export type Pin288 = Assert<
  Eq<Req<NonNullable<NonNullable<NonNullable<T.GetParcelResult>['contentsItems']>[number]>>, never>
>; // GetParcelResult.contentsItems[] required
export type Pin289 = Assert<
  Eq<
    NonNullable<NonNullable<NonNullable<NonNullable<T.GetParcelResult>['contentsItems']>[number]>['contentName']>,
    string
  >
>; // GetParcelResult.contentsItems[].contentName
export type Pin290 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<NonNullable<T.GetParcelResult>['contentsItems']>[number]>['quantity']>, string>
>; // GetParcelResult.contentsItems[].quantity
export type Pin291 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<NonNullable<T.GetParcelResult>['contentsItems']>[number]>['weight']>, string>
>; // GetParcelResult.contentsItems[].weight
export type Pin292 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<NonNullable<T.GetParcelResult>['contentsItems']>[number]>['value']>, string>
>; // GetParcelResult.contentsItems[].value
export type Pin293 = Assert<
  Eq<
    NonNullable<NonNullable<NonNullable<NonNullable<T.GetParcelResult>['contentsItems']>[number]>['customsCode']>,
    string
  >
>; // GetParcelResult.contentsItems[].customsCode
export type Pin294 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<NonNullable<T.GetParcelResult>['contentsItems']>[number]>['country']>, string>
>; // GetParcelResult.contentsItems[].country
export type Pin295 = Assert<
  Eq<keyof NonNullable<NonNullable<NonNullable<T.GetParcelResult>['codPaymentItems']>[number]>, 'agentId' | 'cod'>
>; // GetParcelResult.codPaymentItems[] keys
export type Pin296 = Assert<
  Eq<Req<NonNullable<NonNullable<NonNullable<T.GetParcelResult>['codPaymentItems']>[number]>>, never>
>; // GetParcelResult.codPaymentItems[] required
export type Pin297 = Assert<
  Eq<
    NonNullable<NonNullable<NonNullable<NonNullable<T.GetParcelResult>['codPaymentItems']>[number]>['agentId']>,
    string
  >
>; // GetParcelResult.codPaymentItems[].agentId
export type Pin298 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<NonNullable<T.GetParcelResult>['codPaymentItems']>[number]>['cod']>, string>
>; // GetParcelResult.codPaymentItems[].cod
export type Pin299 = Assert<
  Eq<
    keyof NonNullable<NonNullable<NonNullable<T.GetParcelResult>['goods']>[number]>,
    'article' | 'name' | 'serialNumber' | 'weight' | 'quantity' | 'price' | 'length' | 'width' | 'height'
  >
>; // GetParcelResult.goods[] keys
export type Pin300 = Assert<Eq<Req<NonNullable<NonNullable<NonNullable<T.GetParcelResult>['goods']>[number]>>, never>>; // GetParcelResult.goods[] required
export type Pin301 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<NonNullable<T.GetParcelResult>['goods']>[number]>['article']>, string>
>; // GetParcelResult.goods[].article
export type Pin302 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<NonNullable<T.GetParcelResult>['goods']>[number]>['name']>, string>
>; // GetParcelResult.goods[].name
export type Pin303 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<NonNullable<T.GetParcelResult>['goods']>[number]>['serialNumber']>, string>
>; // GetParcelResult.goods[].serialNumber
export type Pin304 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<NonNullable<T.GetParcelResult>['goods']>[number]>['weight']>, string>
>; // GetParcelResult.goods[].weight
export type Pin305 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<NonNullable<T.GetParcelResult>['goods']>[number]>['quantity']>, string>
>; // GetParcelResult.goods[].quantity
export type Pin306 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<NonNullable<T.GetParcelResult>['goods']>[number]>['price']>, string>
>; // GetParcelResult.goods[].price
export type Pin307 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<NonNullable<T.GetParcelResult>['goods']>[number]>['length']>, string>
>; // GetParcelResult.goods[].length
export type Pin308 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<NonNullable<T.GetParcelResult>['goods']>[number]>['width']>, string>
>; // GetParcelResult.goods[].width
export type Pin309 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<NonNullable<T.GetParcelResult>['goods']>[number]>['height']>, string>
>; // GetParcelResult.goods[].height
export type Pin310 = Assert<
  Eq<
    keyof NonNullable<NonNullable<T.GetParcelResult>['deliveryOptions']>,
    'minAmountGoods' | 'amountDeliveryShortageGoods'
  >
>; // GetParcelResult.deliveryOptions keys
export type Pin311 = Assert<Eq<Req<NonNullable<NonNullable<T.GetParcelResult>['deliveryOptions']>>, never>>; // GetParcelResult.deliveryOptions required
export type Pin312 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<T.GetParcelResult>['deliveryOptions']>['minAmountGoods']>, string>
>; // GetParcelResult.deliveryOptions.minAmountGoods
export type Pin313 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<T.GetParcelResult>['deliveryOptions']>['amountDeliveryShortageGoods']>, string>
>; // GetParcelResult.deliveryOptions.amountDeliveryShortageGoods
export type Pin314 = Assert<
  Eq<keyof NonNullable<NonNullable<T.GetParcelResult>['cardForCOD']>, 'number' | 'ownername' | 'ownermobile'>
>; // GetParcelResult.cardForCOD keys
export type Pin315 = Assert<Eq<Req<NonNullable<NonNullable<T.GetParcelResult>['cardForCOD']>>, never>>; // GetParcelResult.cardForCOD required
export type Pin316 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<T.GetParcelResult>['cardForCOD']>['number']>, string>
>; // GetParcelResult.cardForCOD.number
export type Pin317 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<T.GetParcelResult>['cardForCOD']>['ownername']>, string>
>; // GetParcelResult.cardForCOD.ownername
export type Pin318 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<T.GetParcelResult>['cardForCOD']>['ownermobile']>, string>
>; // GetParcelResult.cardForCOD.ownermobile
export type Pin319 = Assert<Eq<NonNullable<NonNullable<T.GetParcelResult>['return']>, boolean>>; // GetParcelResult.return
export type Pin320 = Assert<
  Eq<
    keyof NonNullable<T.LockParcelRequestBody>,
    'ClientUID' | 'ParcelUID' | 'ClientsShipmentRef' | 'AppName' | 'Notation'
  >
>; // LockParcelRequestBody keys
export type Pin321 = Assert<Eq<Req<NonNullable<T.LockParcelRequestBody>>, 'ClientsShipmentRef'>>; // LockParcelRequestBody required
export type Pin322 = Assert<Eq<NonNullable<NonNullable<T.LockParcelRequestBody>['ClientUID']>, string>>; // LockParcelRequestBody.ClientUID
export type Pin323 = Assert<Eq<NonNullable<NonNullable<T.LockParcelRequestBody>['ParcelUID']>, string>>; // LockParcelRequestBody.ParcelUID
export type Pin324 = Assert<Eq<NonNullable<NonNullable<T.LockParcelRequestBody>['ClientsShipmentRef']>, string>>; // LockParcelRequestBody.ClientsShipmentRef
export type Pin325 = Assert<Eq<NonNullable<NonNullable<T.LockParcelRequestBody>['AppName']>, string>>; // LockParcelRequestBody.AppName
export type Pin326 = Assert<Eq<NonNullable<NonNullable<T.LockParcelRequestBody>['Notation']>, string>>; // LockParcelRequestBody.Notation
export type Pin327 = Assert<Eq<keyof T.OrderDateInfoPathParams, 'streetID'>>; // OrderDateInfoPathParams keys
export type Pin328 = Assert<Eq<Req<T.OrderDateInfoPathParams>, 'streetID'>>; // OrderDateInfoPathParams required
export type Pin329 = Assert<Eq<NonNullable<T.OrderDateInfoPathParams['streetID']>, string>>; // OrderDateInfoPathParams.streetID
export type Pin330 = Assert<Eq<keyof NonNullable<NonNullable<T.OrderDateInfoResult>[number]>, 'date' | 'isAvailable'>>; // OrderDateInfoResult[] keys
export type Pin331 = Assert<Eq<Req<NonNullable<NonNullable<T.OrderDateInfoResult>[number]>>, never>>; // OrderDateInfoResult[] required
export type Pin332 = Assert<Eq<NonNullable<NonNullable<NonNullable<T.OrderDateInfoResult>[number]>['date']>, string>>; // OrderDateInfoResult[].date
export type Pin333 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<T.OrderDateInfoResult>[number]>['isAvailable']>, boolean>
>; // OrderDateInfoResult[].isAvailable
export type Pin334 = Assert<
  Eq<
    keyof NonNullable<T.ParcelRequestBody>,
    | 'parcelNumber'
    | 'subAgent'
    | 'notation'
    | 'contractID'
    | 'payType'
    | 'receiverPay'
    | 'COD'
    | 'weight'
    | 'sendingDate'
    | 'info4Sticker'
    | 'AgentID'
    | 'orderNumber'
    | 'barcode'
    | 'promocode'
    | 'expectedPickUpDate'
    | 'expectedDeliveryDate'
    | 'sender'
    | 'receiver'
    | 'placesItems'
    | 'specConditionsItems'
    | 'contentsItems'
    | 'codPaymentsItems'
    | 'goods'
    | 'cardForCOD'
  >
>; // ParcelRequestBody keys
export type Pin335 = Assert<Eq<Req<NonNullable<T.ParcelRequestBody>>, 'payType' | 'receiverPay'>>; // ParcelRequestBody required
export type Pin336 = Assert<Eq<NonNullable<NonNullable<T.ParcelRequestBody>['parcelNumber']>, string>>; // ParcelRequestBody.parcelNumber
export type Pin337 = Assert<Eq<NonNullable<NonNullable<T.ParcelRequestBody>['subAgent']>, string>>; // ParcelRequestBody.subAgent
export type Pin338 = Assert<Eq<NonNullable<NonNullable<T.ParcelRequestBody>['notation']>, string>>; // ParcelRequestBody.notation
export type Pin339 = Assert<Eq<NonNullable<NonNullable<T.ParcelRequestBody>['contractID']>, string>>; // ParcelRequestBody.contractID
export type Pin340 = Assert<Eq<NonNullable<NonNullable<T.ParcelRequestBody>['payType']>, string>>; // ParcelRequestBody.payType
export type Pin341 = Assert<Eq<NonNullable<NonNullable<T.ParcelRequestBody>['receiverPay']>, boolean>>; // ParcelRequestBody.receiverPay
export type Pin342 = Assert<Eq<NonNullable<NonNullable<T.ParcelRequestBody>['COD']>, number>>; // ParcelRequestBody.COD
export type Pin343 = Assert<Eq<NonNullable<NonNullable<T.ParcelRequestBody>['weight']>, number>>; // ParcelRequestBody.weight
export type Pin344 = Assert<Eq<NonNullable<NonNullable<T.ParcelRequestBody>['sendingDate']>, string>>; // ParcelRequestBody.sendingDate
export type Pin345 = Assert<Eq<NonNullable<NonNullable<T.ParcelRequestBody>['info4Sticker']>, boolean>>; // ParcelRequestBody.info4Sticker
export type Pin346 = Assert<Eq<NonNullable<NonNullable<T.ParcelRequestBody>['AgentID']>, string>>; // ParcelRequestBody.AgentID
export type Pin347 = Assert<Eq<NonNullable<NonNullable<T.ParcelRequestBody>['orderNumber']>, string>>; // ParcelRequestBody.orderNumber
export type Pin348 = Assert<Eq<NonNullable<NonNullable<T.ParcelRequestBody>['barcode']>, string>>; // ParcelRequestBody.barcode
export type Pin349 = Assert<Eq<NonNullable<NonNullable<T.ParcelRequestBody>['promocode']>, string>>; // ParcelRequestBody.promocode
export type Pin350 = Assert<
  Eq<keyof NonNullable<NonNullable<T.ParcelRequestBody>['expectedPickUpDate']>, 'date' | 'timeFrom' | 'timeTo'>
>; // ParcelRequestBody.expectedPickUpDate keys
export type Pin351 = Assert<Eq<Req<NonNullable<NonNullable<T.ParcelRequestBody>['expectedPickUpDate']>>, never>>; // ParcelRequestBody.expectedPickUpDate required
export type Pin352 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<T.ParcelRequestBody>['expectedPickUpDate']>['date']>, string>
>; // ParcelRequestBody.expectedPickUpDate.date
export type Pin353 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<T.ParcelRequestBody>['expectedPickUpDate']>['timeFrom']>, string>
>; // ParcelRequestBody.expectedPickUpDate.timeFrom
export type Pin354 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<T.ParcelRequestBody>['expectedPickUpDate']>['timeTo']>, string>
>; // ParcelRequestBody.expectedPickUpDate.timeTo
export type Pin355 = Assert<
  Eq<keyof NonNullable<NonNullable<T.ParcelRequestBody>['expectedDeliveryDate']>, 'date' | 'timeFrom' | 'timeTo'>
>; // ParcelRequestBody.expectedDeliveryDate keys
export type Pin356 = Assert<Eq<Req<NonNullable<NonNullable<T.ParcelRequestBody>['expectedDeliveryDate']>>, never>>; // ParcelRequestBody.expectedDeliveryDate required
export type Pin357 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<T.ParcelRequestBody>['expectedDeliveryDate']>['date']>, string>
>; // ParcelRequestBody.expectedDeliveryDate.date
export type Pin358 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<T.ParcelRequestBody>['expectedDeliveryDate']>['timeFrom']>, string>
>; // ParcelRequestBody.expectedDeliveryDate.timeFrom
export type Pin359 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<T.ParcelRequestBody>['expectedDeliveryDate']>['timeTo']>, string>
>; // ParcelRequestBody.expectedDeliveryDate.timeTo
export type Pin360 = Assert<
  Eq<
    keyof NonNullable<NonNullable<T.ParcelRequestBody>['sender']>,
    | 'name'
    | 'phone'
    | 'zipCode'
    | 'branchID'
    | 'addressID'
    | 'building'
    | 'flat'
    | 'floor'
    | 'corps'
    | 'service'
    | 'notation'
    | 'countryId'
    | 'cityDescr'
  >
>; // ParcelRequestBody.sender keys
export type Pin361 = Assert<
  Eq<
    Req<NonNullable<NonNullable<T.ParcelRequestBody>['sender']>>,
    'name' | 'phone' | 'branchID' | 'addressID' | 'building' | 'service'
  >
>; // ParcelRequestBody.sender required
export type Pin362 = Assert<Eq<NonNullable<NonNullable<NonNullable<T.ParcelRequestBody>['sender']>['name']>, string>>; // ParcelRequestBody.sender.name
export type Pin363 = Assert<Eq<NonNullable<NonNullable<NonNullable<T.ParcelRequestBody>['sender']>['phone']>, string>>; // ParcelRequestBody.sender.phone
export type Pin364 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<T.ParcelRequestBody>['sender']>['zipCode']>, string>
>; // ParcelRequestBody.sender.zipCode
export type Pin365 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<T.ParcelRequestBody>['sender']>['branchID']>, string>
>; // ParcelRequestBody.sender.branchID
export type Pin366 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<T.ParcelRequestBody>['sender']>['addressID']>, string>
>; // ParcelRequestBody.sender.addressID
export type Pin367 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<T.ParcelRequestBody>['sender']>['building']>, string>
>; // ParcelRequestBody.sender.building
export type Pin368 = Assert<Eq<NonNullable<NonNullable<NonNullable<T.ParcelRequestBody>['sender']>['flat']>, string>>; // ParcelRequestBody.sender.flat
export type Pin369 = Assert<Eq<NonNullable<NonNullable<NonNullable<T.ParcelRequestBody>['sender']>['floor']>, number>>; // ParcelRequestBody.sender.floor
export type Pin370 = Assert<Eq<NonNullable<NonNullable<NonNullable<T.ParcelRequestBody>['sender']>['corps']>, string>>; // ParcelRequestBody.sender.corps
export type Pin371 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<T.ParcelRequestBody>['sender']>['service']>, string>
>; // ParcelRequestBody.sender.service
export type Pin372 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<T.ParcelRequestBody>['sender']>['notation']>, string>
>; // ParcelRequestBody.sender.notation
export type Pin373 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<T.ParcelRequestBody>['sender']>['countryId']>, string>
>; // ParcelRequestBody.sender.countryId
export type Pin374 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<T.ParcelRequestBody>['sender']>['cityDescr']>, string>
>; // ParcelRequestBody.sender.cityDescr
export type Pin375 = Assert<
  Eq<
    keyof NonNullable<NonNullable<T.ParcelRequestBody>['receiver']>,
    | 'name'
    | 'phone'
    | 'zipCode'
    | 'branchID'
    | 'addressID'
    | 'building'
    | 'flat'
    | 'floor'
    | 'corps'
    | 'service'
    | 'countryId'
    | 'regionDescr'
    | 'districtDescr'
    | 'cityDescr'
    | 'addressDescr'
    | 'notation'
    | 'branchIdExternal'
  >
>; // ParcelRequestBody.receiver keys
export type Pin376 = Assert<
  Eq<
    Req<NonNullable<NonNullable<T.ParcelRequestBody>['receiver']>>,
    'name' | 'phone' | 'branchID' | 'addressID' | 'building' | 'service'
  >
>; // ParcelRequestBody.receiver required
export type Pin377 = Assert<Eq<NonNullable<NonNullable<NonNullable<T.ParcelRequestBody>['receiver']>['name']>, string>>; // ParcelRequestBody.receiver.name
export type Pin378 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<T.ParcelRequestBody>['receiver']>['phone']>, string>
>; // ParcelRequestBody.receiver.phone
export type Pin379 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<T.ParcelRequestBody>['receiver']>['zipCode']>, string>
>; // ParcelRequestBody.receiver.zipCode
export type Pin380 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<T.ParcelRequestBody>['receiver']>['branchID']>, string>
>; // ParcelRequestBody.receiver.branchID
export type Pin381 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<T.ParcelRequestBody>['receiver']>['addressID']>, string>
>; // ParcelRequestBody.receiver.addressID
export type Pin382 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<T.ParcelRequestBody>['receiver']>['building']>, string>
>; // ParcelRequestBody.receiver.building
export type Pin383 = Assert<Eq<NonNullable<NonNullable<NonNullable<T.ParcelRequestBody>['receiver']>['flat']>, string>>; // ParcelRequestBody.receiver.flat
export type Pin384 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<T.ParcelRequestBody>['receiver']>['floor']>, number>
>; // ParcelRequestBody.receiver.floor
export type Pin385 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<T.ParcelRequestBody>['receiver']>['corps']>, string>
>; // ParcelRequestBody.receiver.corps
export type Pin386 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<T.ParcelRequestBody>['receiver']>['service']>, string>
>; // ParcelRequestBody.receiver.service
export type Pin387 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<T.ParcelRequestBody>['receiver']>['countryId']>, string>
>; // ParcelRequestBody.receiver.countryId
export type Pin388 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<T.ParcelRequestBody>['receiver']>['regionDescr']>, string>
>; // ParcelRequestBody.receiver.regionDescr
export type Pin389 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<T.ParcelRequestBody>['receiver']>['districtDescr']>, string>
>; // ParcelRequestBody.receiver.districtDescr
export type Pin390 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<T.ParcelRequestBody>['receiver']>['cityDescr']>, string>
>; // ParcelRequestBody.receiver.cityDescr
export type Pin391 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<T.ParcelRequestBody>['receiver']>['addressDescr']>, string>
>; // ParcelRequestBody.receiver.addressDescr
export type Pin392 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<T.ParcelRequestBody>['receiver']>['notation']>, string>
>; // ParcelRequestBody.receiver.notation
export type Pin393 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<T.ParcelRequestBody>['receiver']>['branchIdExternal']>, string>
>; // ParcelRequestBody.receiver.branchIdExternal
export type Pin394 = Assert<
  Eq<
    keyof NonNullable<NonNullable<NonNullable<T.ParcelRequestBody>['placesItems']>[number]>,
    | 'quantity'
    | 'placeWeight'
    | 'weight'
    | 'placeVolume'
    | 'volume'
    | 'insurance'
    | 'packID'
    | 'length'
    | 'width'
    | 'height'
    | 'pallet'
    | 'wheels'
    | 'size'
    | 'formatID'
  >
>; // ParcelRequestBody.placesItems[] keys
export type Pin395 = Assert<
  Eq<
    Req<NonNullable<NonNullable<NonNullable<T.ParcelRequestBody>['placesItems']>[number]>>,
    'quantity' | 'placeWeight' | 'placeVolume'
  >
>; // ParcelRequestBody.placesItems[] required
export type Pin396 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<NonNullable<T.ParcelRequestBody>['placesItems']>[number]>['quantity']>, number>
>; // ParcelRequestBody.placesItems[].quantity
export type Pin397 = Assert<
  Eq<
    NonNullable<NonNullable<NonNullable<NonNullable<T.ParcelRequestBody>['placesItems']>[number]>['placeWeight']>,
    number
  >
>; // ParcelRequestBody.placesItems[].placeWeight
export type Pin398 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<NonNullable<T.ParcelRequestBody>['placesItems']>[number]>['weight']>, number>
>; // ParcelRequestBody.placesItems[].weight
export type Pin399 = Assert<
  Eq<
    NonNullable<NonNullable<NonNullable<NonNullable<T.ParcelRequestBody>['placesItems']>[number]>['placeVolume']>,
    number
  >
>; // ParcelRequestBody.placesItems[].placeVolume
export type Pin400 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<NonNullable<T.ParcelRequestBody>['placesItems']>[number]>['volume']>, number>
>; // ParcelRequestBody.placesItems[].volume
export type Pin401 = Assert<
  Eq<
    NonNullable<NonNullable<NonNullable<NonNullable<T.ParcelRequestBody>['placesItems']>[number]>['insurance']>,
    number
  >
>; // ParcelRequestBody.placesItems[].insurance
export type Pin402 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<NonNullable<T.ParcelRequestBody>['placesItems']>[number]>['packID']>, string>
>; // ParcelRequestBody.placesItems[].packID
export type Pin403 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<NonNullable<T.ParcelRequestBody>['placesItems']>[number]>['length']>, number>
>; // ParcelRequestBody.placesItems[].length
export type Pin404 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<NonNullable<T.ParcelRequestBody>['placesItems']>[number]>['width']>, number>
>; // ParcelRequestBody.placesItems[].width
export type Pin405 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<NonNullable<T.ParcelRequestBody>['placesItems']>[number]>['height']>, number>
>; // ParcelRequestBody.placesItems[].height
export type Pin406 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<NonNullable<T.ParcelRequestBody>['placesItems']>[number]>['pallet']>, boolean>
>; // ParcelRequestBody.placesItems[].pallet
export type Pin407 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<NonNullable<T.ParcelRequestBody>['placesItems']>[number]>['wheels']>, string>
>; // ParcelRequestBody.placesItems[].wheels
export type Pin408 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<NonNullable<T.ParcelRequestBody>['placesItems']>[number]>['size']>, string>
>; // ParcelRequestBody.placesItems[].size
export type Pin409 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<NonNullable<T.ParcelRequestBody>['placesItems']>[number]>['formatID']>, string>
>; // ParcelRequestBody.placesItems[].formatID
export type Pin410 = Assert<
  Eq<keyof NonNullable<NonNullable<NonNullable<T.ParcelRequestBody>['specConditionsItems']>[number]>, 'conditionID'>
>; // ParcelRequestBody.specConditionsItems[] keys
export type Pin411 = Assert<
  Eq<Req<NonNullable<NonNullable<NonNullable<T.ParcelRequestBody>['specConditionsItems']>[number]>>, never>
>; // ParcelRequestBody.specConditionsItems[] required
export type Pin412 = Assert<
  Eq<
    NonNullable<
      NonNullable<NonNullable<NonNullable<T.ParcelRequestBody>['specConditionsItems']>[number]>['conditionID']
    >,
    string
  >
>; // ParcelRequestBody.specConditionsItems[].conditionID
export type Pin413 = Assert<
  Eq<
    keyof NonNullable<NonNullable<NonNullable<T.ParcelRequestBody>['contentsItems']>[number]>,
    | 'contentName'
    | 'quantity'
    | 'weight'
    | 'value'
    | 'customsCode'
    | 'country'
    | 'size'
    | 'ean13'
    | 'gender'
    | 'valueReceiverCurrency'
  >
>; // ParcelRequestBody.contentsItems[] keys
export type Pin414 = Assert<
  Eq<
    Req<NonNullable<NonNullable<NonNullable<T.ParcelRequestBody>['contentsItems']>[number]>>,
    'contentName' | 'quantity' | 'weight' | 'value'
  >
>; // ParcelRequestBody.contentsItems[] required
export type Pin415 = Assert<
  Eq<
    NonNullable<NonNullable<NonNullable<NonNullable<T.ParcelRequestBody>['contentsItems']>[number]>['contentName']>,
    string
  >
>; // ParcelRequestBody.contentsItems[].contentName
export type Pin416 = Assert<
  Eq<
    NonNullable<NonNullable<NonNullable<NonNullable<T.ParcelRequestBody>['contentsItems']>[number]>['quantity']>,
    number
  >
>; // ParcelRequestBody.contentsItems[].quantity
export type Pin417 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<NonNullable<T.ParcelRequestBody>['contentsItems']>[number]>['weight']>, number>
>; // ParcelRequestBody.contentsItems[].weight
export type Pin418 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<NonNullable<T.ParcelRequestBody>['contentsItems']>[number]>['value']>, number>
>; // ParcelRequestBody.contentsItems[].value
export type Pin419 = Assert<
  Eq<
    NonNullable<NonNullable<NonNullable<NonNullable<T.ParcelRequestBody>['contentsItems']>[number]>['customsCode']>,
    string
  >
>; // ParcelRequestBody.contentsItems[].customsCode
export type Pin420 = Assert<
  Eq<
    NonNullable<NonNullable<NonNullable<NonNullable<T.ParcelRequestBody>['contentsItems']>[number]>['country']>,
    string
  >
>; // ParcelRequestBody.contentsItems[].country
export type Pin421 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<NonNullable<T.ParcelRequestBody>['contentsItems']>[number]>['size']>, string>
>; // ParcelRequestBody.contentsItems[].size
export type Pin422 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<NonNullable<T.ParcelRequestBody>['contentsItems']>[number]>['ean13']>, string>
>; // ParcelRequestBody.contentsItems[].ean13
export type Pin423 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<NonNullable<T.ParcelRequestBody>['contentsItems']>[number]>['gender']>, string>
>; // ParcelRequestBody.contentsItems[].gender
export type Pin424 = Assert<
  Eq<
    NonNullable<
      NonNullable<NonNullable<NonNullable<T.ParcelRequestBody>['contentsItems']>[number]>['valueReceiverCurrency']
    >,
    string
  >
>; // ParcelRequestBody.contentsItems[].valueReceiverCurrency
export type Pin425 = Assert<
  Eq<keyof NonNullable<NonNullable<NonNullable<T.ParcelRequestBody>['codPaymentsItems']>[number]>, 'agentId' | 'cod'>
>; // ParcelRequestBody.codPaymentsItems[] keys
export type Pin426 = Assert<
  Eq<Req<NonNullable<NonNullable<NonNullable<T.ParcelRequestBody>['codPaymentsItems']>[number]>>, 'agentId' | 'cod'>
>; // ParcelRequestBody.codPaymentsItems[] required
export type Pin427 = Assert<
  Eq<
    NonNullable<NonNullable<NonNullable<NonNullable<T.ParcelRequestBody>['codPaymentsItems']>[number]>['agentId']>,
    string
  >
>; // ParcelRequestBody.codPaymentsItems[].agentId
export type Pin428 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<NonNullable<T.ParcelRequestBody>['codPaymentsItems']>[number]>['cod']>, number>
>; // ParcelRequestBody.codPaymentsItems[].cod
export type Pin429 = Assert<
  Eq<
    keyof NonNullable<NonNullable<NonNullable<T.ParcelRequestBody>['goods']>[number]>,
    'article' | 'name' | 'serialNumber' | 'weight' | 'quantity' | 'price' | 'length' | 'width' | 'height'
  >
>; // ParcelRequestBody.goods[] keys
export type Pin430 = Assert<
  Eq<
    Req<NonNullable<NonNullable<NonNullable<T.ParcelRequestBody>['goods']>[number]>>,
    'article' | 'name' | 'weight' | 'quantity' | 'price'
  >
>; // ParcelRequestBody.goods[] required
export type Pin431 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<NonNullable<T.ParcelRequestBody>['goods']>[number]>['article']>, string>
>; // ParcelRequestBody.goods[].article
export type Pin432 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<NonNullable<T.ParcelRequestBody>['goods']>[number]>['name']>, string>
>; // ParcelRequestBody.goods[].name
export type Pin433 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<NonNullable<T.ParcelRequestBody>['goods']>[number]>['serialNumber']>, string>
>; // ParcelRequestBody.goods[].serialNumber
export type Pin434 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<NonNullable<T.ParcelRequestBody>['goods']>[number]>['weight']>, number>
>; // ParcelRequestBody.goods[].weight
export type Pin435 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<NonNullable<T.ParcelRequestBody>['goods']>[number]>['quantity']>, number>
>; // ParcelRequestBody.goods[].quantity
export type Pin436 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<NonNullable<T.ParcelRequestBody>['goods']>[number]>['price']>, number>
>; // ParcelRequestBody.goods[].price
export type Pin437 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<NonNullable<T.ParcelRequestBody>['goods']>[number]>['length']>, number>
>; // ParcelRequestBody.goods[].length
export type Pin438 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<NonNullable<T.ParcelRequestBody>['goods']>[number]>['width']>, number>
>; // ParcelRequestBody.goods[].width
export type Pin439 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<NonNullable<T.ParcelRequestBody>['goods']>[number]>['height']>, number>
>; // ParcelRequestBody.goods[].height
export type Pin440 = Assert<
  Eq<keyof NonNullable<NonNullable<T.ParcelRequestBody>['cardForCOD']>, 'number' | 'ownername' | 'ownermobile'>
>; // ParcelRequestBody.cardForCOD keys
export type Pin441 = Assert<
  Eq<Req<NonNullable<NonNullable<T.ParcelRequestBody>['cardForCOD']>>, 'number' | 'ownermobile'>
>; // ParcelRequestBody.cardForCOD required
export type Pin442 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<T.ParcelRequestBody>['cardForCOD']>['number']>, string>
>; // ParcelRequestBody.cardForCOD.number
export type Pin443 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<T.ParcelRequestBody>['cardForCOD']>['ownername']>, string>
>; // ParcelRequestBody.cardForCOD.ownername
export type Pin444 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<T.ParcelRequestBody>['cardForCOD']>['ownermobile']>, string>
>; // ParcelRequestBody.cardForCOD.ownermobile
export type Pin445 = Assert<
  Eq<
    keyof NonNullable<T.ParcelResult>,
    | 'parcelID'
    | 'AgentID'
    | 'barCode'
    | 'costServices'
    | 'estimatedDeliveryDate'
    | 'parcelNumber'
    | 'branchName'
    | 'branchCode'
    | 'branchAddressDetails'
    | 'deliveryType'
    | 'formatType'
    | 'totalPlaces'
    | 'hikingServiceRoute'
    | 'mainServiceRoute'
    | 'receiverName'
    | 'receiverPhone'
    | 'receiverCity'
    | 'receiverDistrict'
    | 'receiverRegion'
    | 'receiverAddress'
    | 'receiverBuilding'
    | 'receiverFlat'
    | 'COD'
    | 'notation'
    | 'value'
  >
>; // ParcelResult keys
export type Pin446 = Assert<Eq<Req<NonNullable<T.ParcelResult>>, never>>; // ParcelResult required
export type Pin447 = Assert<Eq<NonNullable<NonNullable<T.ParcelResult>['parcelID']>, string>>; // ParcelResult.parcelID
export type Pin448 = Assert<Eq<NonNullable<NonNullable<T.ParcelResult>['AgentID']>, string>>; // ParcelResult.AgentID
export type Pin449 = Assert<Eq<NonNullable<NonNullable<T.ParcelResult>['barCode']>, string>>; // ParcelResult.barCode
export type Pin450 = Assert<Eq<NonNullable<NonNullable<T.ParcelResult>['costServices']>, number>>; // ParcelResult.costServices
export type Pin451 = Assert<Eq<NonNullable<NonNullable<T.ParcelResult>['estimatedDeliveryDate']>, string>>; // ParcelResult.estimatedDeliveryDate
export type Pin452 = Assert<Eq<NonNullable<NonNullable<T.ParcelResult>['parcelNumber']>, string>>; // ParcelResult.parcelNumber
export type Pin453 = Assert<Eq<NonNullable<NonNullable<T.ParcelResult>['branchName']>, string>>; // ParcelResult.branchName
export type Pin454 = Assert<Eq<NonNullable<NonNullable<T.ParcelResult>['branchCode']>, string>>; // ParcelResult.branchCode
export type Pin455 = Assert<Eq<NonNullable<NonNullable<T.ParcelResult>['branchAddressDetails']>, string>>; // ParcelResult.branchAddressDetails
export type Pin456 = Assert<Eq<NonNullable<NonNullable<T.ParcelResult>['deliveryType']>, string>>; // ParcelResult.deliveryType
export type Pin457 = Assert<Eq<NonNullable<NonNullable<T.ParcelResult>['formatType']>, string>>; // ParcelResult.formatType
export type Pin458 = Assert<Eq<NonNullable<NonNullable<T.ParcelResult>['totalPlaces']>, number>>; // ParcelResult.totalPlaces
export type Pin459 = Assert<Eq<NonNullable<NonNullable<T.ParcelResult>['hikingServiceRoute']>, string>>; // ParcelResult.hikingServiceRoute
export type Pin460 = Assert<Eq<NonNullable<NonNullable<T.ParcelResult>['mainServiceRoute']>, string>>; // ParcelResult.mainServiceRoute
export type Pin461 = Assert<Eq<NonNullable<NonNullable<T.ParcelResult>['receiverName']>, string>>; // ParcelResult.receiverName
export type Pin462 = Assert<Eq<NonNullable<NonNullable<T.ParcelResult>['receiverPhone']>, string>>; // ParcelResult.receiverPhone
export type Pin463 = Assert<Eq<NonNullable<NonNullable<T.ParcelResult>['receiverCity']>, string>>; // ParcelResult.receiverCity
export type Pin464 = Assert<Eq<NonNullable<NonNullable<T.ParcelResult>['receiverDistrict']>, string>>; // ParcelResult.receiverDistrict
export type Pin465 = Assert<Eq<NonNullable<NonNullable<T.ParcelResult>['receiverRegion']>, string>>; // ParcelResult.receiverRegion
export type Pin466 = Assert<Eq<NonNullable<NonNullable<T.ParcelResult>['receiverAddress']>, string>>; // ParcelResult.receiverAddress
export type Pin467 = Assert<Eq<NonNullable<NonNullable<T.ParcelResult>['receiverBuilding']>, string>>; // ParcelResult.receiverBuilding
export type Pin468 = Assert<Eq<NonNullable<NonNullable<T.ParcelResult>['receiverFlat']>, string>>; // ParcelResult.receiverFlat
export type Pin469 = Assert<Eq<NonNullable<NonNullable<T.ParcelResult>['COD']>, number>>; // ParcelResult.COD
export type Pin470 = Assert<Eq<NonNullable<NonNullable<T.ParcelResult>['notation']>, string>>; // ParcelResult.notation
export type Pin471 = Assert<Eq<NonNullable<NonNullable<T.ParcelResult>['value']>, number>>; // ParcelResult.value
export type Pin472 = Assert<
  Eq<keyof NonNullable<T.ParcelChangeContractIDRequestBody>, 'contractID' | 'payType' | 'receiverPay'>
>; // ParcelChangeContractIDRequestBody keys
export type Pin473 = Assert<Eq<Req<NonNullable<T.ParcelChangeContractIDRequestBody>>, 'contractID'>>; // ParcelChangeContractIDRequestBody required
export type Pin474 = Assert<Eq<NonNullable<NonNullable<T.ParcelChangeContractIDRequestBody>['contractID']>, string>>; // ParcelChangeContractIDRequestBody.contractID
export type Pin475 = Assert<Eq<NonNullable<NonNullable<T.ParcelChangeContractIDRequestBody>['payType']>, string>>; // ParcelChangeContractIDRequestBody.payType
export type Pin476 = Assert<Eq<NonNullable<NonNullable<T.ParcelChangeContractIDRequestBody>['receiverPay']>, string>>; // ParcelChangeContractIDRequestBody.receiverPay
export type Pin477 = Assert<Eq<keyof T.ParcelChangeContractIDQueryParams, 'barCode'>>; // ParcelChangeContractIDQueryParams keys
export type Pin478 = Assert<Eq<Req<T.ParcelChangeContractIDQueryParams>, 'barCode'>>; // ParcelChangeContractIDQueryParams required
export type Pin479 = Assert<Eq<NonNullable<T.ParcelChangeContractIDQueryParams['barCode']>, string>>; // ParcelChangeContractIDQueryParams.barCode
export type Pin480 = Assert<Eq<NonNullable<T.ParcelChangeContractIDResult>, Record<string, unknown>>>; // ParcelChangeContractIDResult
export type Pin481 = Assert<Eq<keyof T.ParcelDeletePathParams, 'parcelID' | 'contractID'>>; // ParcelDeletePathParams keys
export type Pin482 = Assert<Eq<Req<T.ParcelDeletePathParams>, 'parcelID'>>; // ParcelDeletePathParams required
export type Pin483 = Assert<Eq<NonNullable<T.ParcelDeletePathParams['parcelID']>, string>>; // ParcelDeletePathParams.parcelID
export type Pin484 = Assert<Eq<NonNullable<T.ParcelDeletePathParams['contractID']>, string>>; // ParcelDeletePathParams.contractID
export type Pin485 = Assert<Eq<NonNullable<T.ParcelDeleteResult>, Record<string, unknown>>>; // ParcelDeleteResult
export type Pin486 = Assert<
  Eq<
    keyof NonNullable<T.ParcelPutRequestBody>,
    | 'parcelNumber'
    | 'subAgent'
    | 'notation'
    | 'contractID'
    | 'payType'
    | 'receiverPay'
    | 'COD'
    | 'weight'
    | 'sendingDate'
    | 'info4Sticker'
    | 'AgentID'
    | 'orderNumber'
    | 'barcode'
    | 'promocode'
    | 'expectedPickUpDate'
    | 'expectedDeliveryDate'
    | 'sender'
    | 'receiver'
    | 'placesItems'
    | 'specConditionsItems'
    | 'contentsItems'
    | 'codPaymentsItems'
    | 'goods'
    | 'cardForCOD'
  >
>; // ParcelPutRequestBody keys
export type Pin487 = Assert<Eq<Req<NonNullable<T.ParcelPutRequestBody>>, 'payType' | 'receiverPay'>>; // ParcelPutRequestBody required
export type Pin488 = Assert<Eq<NonNullable<NonNullable<T.ParcelPutRequestBody>['parcelNumber']>, string>>; // ParcelPutRequestBody.parcelNumber
export type Pin489 = Assert<Eq<NonNullable<NonNullable<T.ParcelPutRequestBody>['subAgent']>, string>>; // ParcelPutRequestBody.subAgent
export type Pin490 = Assert<Eq<NonNullable<NonNullable<T.ParcelPutRequestBody>['notation']>, string>>; // ParcelPutRequestBody.notation
export type Pin491 = Assert<Eq<NonNullable<NonNullable<T.ParcelPutRequestBody>['contractID']>, string>>; // ParcelPutRequestBody.contractID
export type Pin492 = Assert<Eq<NonNullable<NonNullable<T.ParcelPutRequestBody>['payType']>, string>>; // ParcelPutRequestBody.payType
export type Pin493 = Assert<Eq<NonNullable<NonNullable<T.ParcelPutRequestBody>['receiverPay']>, boolean>>; // ParcelPutRequestBody.receiverPay
export type Pin494 = Assert<Eq<NonNullable<NonNullable<T.ParcelPutRequestBody>['COD']>, number>>; // ParcelPutRequestBody.COD
export type Pin495 = Assert<Eq<NonNullable<NonNullable<T.ParcelPutRequestBody>['weight']>, number>>; // ParcelPutRequestBody.weight
export type Pin496 = Assert<Eq<NonNullable<NonNullable<T.ParcelPutRequestBody>['sendingDate']>, string>>; // ParcelPutRequestBody.sendingDate
export type Pin497 = Assert<Eq<NonNullable<NonNullable<T.ParcelPutRequestBody>['info4Sticker']>, boolean>>; // ParcelPutRequestBody.info4Sticker
export type Pin498 = Assert<Eq<NonNullable<NonNullable<T.ParcelPutRequestBody>['AgentID']>, string>>; // ParcelPutRequestBody.AgentID
export type Pin499 = Assert<Eq<NonNullable<NonNullable<T.ParcelPutRequestBody>['orderNumber']>, string>>; // ParcelPutRequestBody.orderNumber
export type Pin500 = Assert<Eq<NonNullable<NonNullable<T.ParcelPutRequestBody>['barcode']>, string>>; // ParcelPutRequestBody.barcode
export type Pin501 = Assert<Eq<NonNullable<NonNullable<T.ParcelPutRequestBody>['promocode']>, string>>; // ParcelPutRequestBody.promocode
export type Pin502 = Assert<
  Eq<keyof NonNullable<NonNullable<T.ParcelPutRequestBody>['expectedPickUpDate']>, 'date' | 'timeFrom' | 'timeTo'>
>; // ParcelPutRequestBody.expectedPickUpDate keys
export type Pin503 = Assert<Eq<Req<NonNullable<NonNullable<T.ParcelPutRequestBody>['expectedPickUpDate']>>, never>>; // ParcelPutRequestBody.expectedPickUpDate required
export type Pin504 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<T.ParcelPutRequestBody>['expectedPickUpDate']>['date']>, string>
>; // ParcelPutRequestBody.expectedPickUpDate.date
export type Pin505 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<T.ParcelPutRequestBody>['expectedPickUpDate']>['timeFrom']>, string>
>; // ParcelPutRequestBody.expectedPickUpDate.timeFrom
export type Pin506 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<T.ParcelPutRequestBody>['expectedPickUpDate']>['timeTo']>, string>
>; // ParcelPutRequestBody.expectedPickUpDate.timeTo
export type Pin507 = Assert<
  Eq<keyof NonNullable<NonNullable<T.ParcelPutRequestBody>['expectedDeliveryDate']>, 'date' | 'timeFrom' | 'timeTo'>
>; // ParcelPutRequestBody.expectedDeliveryDate keys
export type Pin508 = Assert<Eq<Req<NonNullable<NonNullable<T.ParcelPutRequestBody>['expectedDeliveryDate']>>, never>>; // ParcelPutRequestBody.expectedDeliveryDate required
export type Pin509 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<T.ParcelPutRequestBody>['expectedDeliveryDate']>['date']>, string>
>; // ParcelPutRequestBody.expectedDeliveryDate.date
export type Pin510 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<T.ParcelPutRequestBody>['expectedDeliveryDate']>['timeFrom']>, string>
>; // ParcelPutRequestBody.expectedDeliveryDate.timeFrom
export type Pin511 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<T.ParcelPutRequestBody>['expectedDeliveryDate']>['timeTo']>, string>
>; // ParcelPutRequestBody.expectedDeliveryDate.timeTo
export type Pin512 = Assert<
  Eq<
    keyof NonNullable<NonNullable<T.ParcelPutRequestBody>['sender']>,
    | 'name'
    | 'phone'
    | 'zipCode'
    | 'branchID'
    | 'addressID'
    | 'building'
    | 'flat'
    | 'floor'
    | 'corps'
    | 'service'
    | 'notation'
    | 'countryId'
    | 'cityDescr'
  >
>; // ParcelPutRequestBody.sender keys
export type Pin513 = Assert<
  Eq<
    Req<NonNullable<NonNullable<T.ParcelPutRequestBody>['sender']>>,
    'name' | 'phone' | 'branchID' | 'addressID' | 'building' | 'service'
  >
>; // ParcelPutRequestBody.sender required
export type Pin514 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<T.ParcelPutRequestBody>['sender']>['name']>, string>
>; // ParcelPutRequestBody.sender.name
export type Pin515 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<T.ParcelPutRequestBody>['sender']>['phone']>, string>
>; // ParcelPutRequestBody.sender.phone
export type Pin516 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<T.ParcelPutRequestBody>['sender']>['zipCode']>, string>
>; // ParcelPutRequestBody.sender.zipCode
export type Pin517 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<T.ParcelPutRequestBody>['sender']>['branchID']>, string>
>; // ParcelPutRequestBody.sender.branchID
export type Pin518 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<T.ParcelPutRequestBody>['sender']>['addressID']>, string>
>; // ParcelPutRequestBody.sender.addressID
export type Pin519 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<T.ParcelPutRequestBody>['sender']>['building']>, string>
>; // ParcelPutRequestBody.sender.building
export type Pin520 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<T.ParcelPutRequestBody>['sender']>['flat']>, string>
>; // ParcelPutRequestBody.sender.flat
export type Pin521 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<T.ParcelPutRequestBody>['sender']>['floor']>, number>
>; // ParcelPutRequestBody.sender.floor
export type Pin522 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<T.ParcelPutRequestBody>['sender']>['corps']>, string>
>; // ParcelPutRequestBody.sender.corps
export type Pin523 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<T.ParcelPutRequestBody>['sender']>['service']>, string>
>; // ParcelPutRequestBody.sender.service
export type Pin524 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<T.ParcelPutRequestBody>['sender']>['notation']>, string>
>; // ParcelPutRequestBody.sender.notation
export type Pin525 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<T.ParcelPutRequestBody>['sender']>['countryId']>, string>
>; // ParcelPutRequestBody.sender.countryId
export type Pin526 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<T.ParcelPutRequestBody>['sender']>['cityDescr']>, string>
>; // ParcelPutRequestBody.sender.cityDescr
export type Pin527 = Assert<
  Eq<
    keyof NonNullable<NonNullable<T.ParcelPutRequestBody>['receiver']>,
    | 'name'
    | 'phone'
    | 'zipCode'
    | 'branchID'
    | 'addressID'
    | 'building'
    | 'flat'
    | 'floor'
    | 'corps'
    | 'service'
    | 'countryId'
    | 'regionDescr'
    | 'districtDescr'
    | 'cityDescr'
    | 'addressDescr'
    | 'notation'
    | 'branchIdExternal'
  >
>; // ParcelPutRequestBody.receiver keys
export type Pin528 = Assert<
  Eq<
    Req<NonNullable<NonNullable<T.ParcelPutRequestBody>['receiver']>>,
    'name' | 'phone' | 'branchID' | 'addressID' | 'building' | 'service'
  >
>; // ParcelPutRequestBody.receiver required
export type Pin529 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<T.ParcelPutRequestBody>['receiver']>['name']>, string>
>; // ParcelPutRequestBody.receiver.name
export type Pin530 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<T.ParcelPutRequestBody>['receiver']>['phone']>, string>
>; // ParcelPutRequestBody.receiver.phone
export type Pin531 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<T.ParcelPutRequestBody>['receiver']>['zipCode']>, string>
>; // ParcelPutRequestBody.receiver.zipCode
export type Pin532 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<T.ParcelPutRequestBody>['receiver']>['branchID']>, string>
>; // ParcelPutRequestBody.receiver.branchID
export type Pin533 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<T.ParcelPutRequestBody>['receiver']>['addressID']>, string>
>; // ParcelPutRequestBody.receiver.addressID
export type Pin534 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<T.ParcelPutRequestBody>['receiver']>['building']>, string>
>; // ParcelPutRequestBody.receiver.building
export type Pin535 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<T.ParcelPutRequestBody>['receiver']>['flat']>, string>
>; // ParcelPutRequestBody.receiver.flat
export type Pin536 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<T.ParcelPutRequestBody>['receiver']>['floor']>, number>
>; // ParcelPutRequestBody.receiver.floor
export type Pin537 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<T.ParcelPutRequestBody>['receiver']>['corps']>, string>
>; // ParcelPutRequestBody.receiver.corps
export type Pin538 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<T.ParcelPutRequestBody>['receiver']>['service']>, string>
>; // ParcelPutRequestBody.receiver.service
export type Pin539 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<T.ParcelPutRequestBody>['receiver']>['countryId']>, string>
>; // ParcelPutRequestBody.receiver.countryId
export type Pin540 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<T.ParcelPutRequestBody>['receiver']>['regionDescr']>, string>
>; // ParcelPutRequestBody.receiver.regionDescr
export type Pin541 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<T.ParcelPutRequestBody>['receiver']>['districtDescr']>, string>
>; // ParcelPutRequestBody.receiver.districtDescr
export type Pin542 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<T.ParcelPutRequestBody>['receiver']>['cityDescr']>, string>
>; // ParcelPutRequestBody.receiver.cityDescr
export type Pin543 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<T.ParcelPutRequestBody>['receiver']>['addressDescr']>, string>
>; // ParcelPutRequestBody.receiver.addressDescr
export type Pin544 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<T.ParcelPutRequestBody>['receiver']>['notation']>, string>
>; // ParcelPutRequestBody.receiver.notation
export type Pin545 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<T.ParcelPutRequestBody>['receiver']>['branchIdExternal']>, string>
>; // ParcelPutRequestBody.receiver.branchIdExternal
export type Pin546 = Assert<
  Eq<
    keyof NonNullable<NonNullable<NonNullable<T.ParcelPutRequestBody>['placesItems']>[number]>,
    | 'quantity'
    | 'placeWeight'
    | 'weight'
    | 'placeVolume'
    | 'volume'
    | 'insurance'
    | 'packID'
    | 'length'
    | 'width'
    | 'height'
    | 'pallet'
    | 'wheels'
    | 'size'
    | 'formatID'
  >
>; // ParcelPutRequestBody.placesItems[] keys
export type Pin547 = Assert<
  Eq<
    Req<NonNullable<NonNullable<NonNullable<T.ParcelPutRequestBody>['placesItems']>[number]>>,
    'quantity' | 'placeWeight' | 'placeVolume'
  >
>; // ParcelPutRequestBody.placesItems[] required
export type Pin548 = Assert<
  Eq<
    NonNullable<NonNullable<NonNullable<NonNullable<T.ParcelPutRequestBody>['placesItems']>[number]>['quantity']>,
    number
  >
>; // ParcelPutRequestBody.placesItems[].quantity
export type Pin549 = Assert<
  Eq<
    NonNullable<NonNullable<NonNullable<NonNullable<T.ParcelPutRequestBody>['placesItems']>[number]>['placeWeight']>,
    number
  >
>; // ParcelPutRequestBody.placesItems[].placeWeight
export type Pin550 = Assert<
  Eq<
    NonNullable<NonNullable<NonNullable<NonNullable<T.ParcelPutRequestBody>['placesItems']>[number]>['weight']>,
    number
  >
>; // ParcelPutRequestBody.placesItems[].weight
export type Pin551 = Assert<
  Eq<
    NonNullable<NonNullable<NonNullable<NonNullable<T.ParcelPutRequestBody>['placesItems']>[number]>['placeVolume']>,
    number
  >
>; // ParcelPutRequestBody.placesItems[].placeVolume
export type Pin552 = Assert<
  Eq<
    NonNullable<NonNullable<NonNullable<NonNullable<T.ParcelPutRequestBody>['placesItems']>[number]>['volume']>,
    number
  >
>; // ParcelPutRequestBody.placesItems[].volume
export type Pin553 = Assert<
  Eq<
    NonNullable<NonNullable<NonNullable<NonNullable<T.ParcelPutRequestBody>['placesItems']>[number]>['insurance']>,
    number
  >
>; // ParcelPutRequestBody.placesItems[].insurance
export type Pin554 = Assert<
  Eq<
    NonNullable<NonNullable<NonNullable<NonNullable<T.ParcelPutRequestBody>['placesItems']>[number]>['packID']>,
    string
  >
>; // ParcelPutRequestBody.placesItems[].packID
export type Pin555 = Assert<
  Eq<
    NonNullable<NonNullable<NonNullable<NonNullable<T.ParcelPutRequestBody>['placesItems']>[number]>['length']>,
    number
  >
>; // ParcelPutRequestBody.placesItems[].length
export type Pin556 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<NonNullable<T.ParcelPutRequestBody>['placesItems']>[number]>['width']>, number>
>; // ParcelPutRequestBody.placesItems[].width
export type Pin557 = Assert<
  Eq<
    NonNullable<NonNullable<NonNullable<NonNullable<T.ParcelPutRequestBody>['placesItems']>[number]>['height']>,
    number
  >
>; // ParcelPutRequestBody.placesItems[].height
export type Pin558 = Assert<
  Eq<
    NonNullable<NonNullable<NonNullable<NonNullable<T.ParcelPutRequestBody>['placesItems']>[number]>['pallet']>,
    boolean
  >
>; // ParcelPutRequestBody.placesItems[].pallet
export type Pin559 = Assert<
  Eq<
    NonNullable<NonNullable<NonNullable<NonNullable<T.ParcelPutRequestBody>['placesItems']>[number]>['wheels']>,
    string
  >
>; // ParcelPutRequestBody.placesItems[].wheels
export type Pin560 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<NonNullable<T.ParcelPutRequestBody>['placesItems']>[number]>['size']>, string>
>; // ParcelPutRequestBody.placesItems[].size
export type Pin561 = Assert<
  Eq<
    NonNullable<NonNullable<NonNullable<NonNullable<T.ParcelPutRequestBody>['placesItems']>[number]>['formatID']>,
    string
  >
>; // ParcelPutRequestBody.placesItems[].formatID
export type Pin562 = Assert<
  Eq<keyof NonNullable<NonNullable<NonNullable<T.ParcelPutRequestBody>['specConditionsItems']>[number]>, 'conditionID'>
>; // ParcelPutRequestBody.specConditionsItems[] keys
export type Pin563 = Assert<
  Eq<Req<NonNullable<NonNullable<NonNullable<T.ParcelPutRequestBody>['specConditionsItems']>[number]>>, never>
>; // ParcelPutRequestBody.specConditionsItems[] required
export type Pin564 = Assert<
  Eq<
    NonNullable<
      NonNullable<NonNullable<NonNullable<T.ParcelPutRequestBody>['specConditionsItems']>[number]>['conditionID']
    >,
    string
  >
>; // ParcelPutRequestBody.specConditionsItems[].conditionID
export type Pin565 = Assert<
  Eq<
    keyof NonNullable<NonNullable<NonNullable<T.ParcelPutRequestBody>['contentsItems']>[number]>,
    | 'contentName'
    | 'quantity'
    | 'weight'
    | 'value'
    | 'customsCode'
    | 'country'
    | 'size'
    | 'ean13'
    | 'gender'
    | 'valueReceiverCurrency'
  >
>; // ParcelPutRequestBody.contentsItems[] keys
export type Pin566 = Assert<
  Eq<
    Req<NonNullable<NonNullable<NonNullable<T.ParcelPutRequestBody>['contentsItems']>[number]>>,
    'contentName' | 'quantity' | 'weight' | 'value'
  >
>; // ParcelPutRequestBody.contentsItems[] required
export type Pin567 = Assert<
  Eq<
    NonNullable<NonNullable<NonNullable<NonNullable<T.ParcelPutRequestBody>['contentsItems']>[number]>['contentName']>,
    string
  >
>; // ParcelPutRequestBody.contentsItems[].contentName
export type Pin568 = Assert<
  Eq<
    NonNullable<NonNullable<NonNullable<NonNullable<T.ParcelPutRequestBody>['contentsItems']>[number]>['quantity']>,
    number
  >
>; // ParcelPutRequestBody.contentsItems[].quantity
export type Pin569 = Assert<
  Eq<
    NonNullable<NonNullable<NonNullable<NonNullable<T.ParcelPutRequestBody>['contentsItems']>[number]>['weight']>,
    number
  >
>; // ParcelPutRequestBody.contentsItems[].weight
export type Pin570 = Assert<
  Eq<
    NonNullable<NonNullable<NonNullable<NonNullable<T.ParcelPutRequestBody>['contentsItems']>[number]>['value']>,
    number
  >
>; // ParcelPutRequestBody.contentsItems[].value
export type Pin571 = Assert<
  Eq<
    NonNullable<NonNullable<NonNullable<NonNullable<T.ParcelPutRequestBody>['contentsItems']>[number]>['customsCode']>,
    string
  >
>; // ParcelPutRequestBody.contentsItems[].customsCode
export type Pin572 = Assert<
  Eq<
    NonNullable<NonNullable<NonNullable<NonNullable<T.ParcelPutRequestBody>['contentsItems']>[number]>['country']>,
    string
  >
>; // ParcelPutRequestBody.contentsItems[].country
export type Pin573 = Assert<
  Eq<
    NonNullable<NonNullable<NonNullable<NonNullable<T.ParcelPutRequestBody>['contentsItems']>[number]>['size']>,
    string
  >
>; // ParcelPutRequestBody.contentsItems[].size
export type Pin574 = Assert<
  Eq<
    NonNullable<NonNullable<NonNullable<NonNullable<T.ParcelPutRequestBody>['contentsItems']>[number]>['ean13']>,
    string
  >
>; // ParcelPutRequestBody.contentsItems[].ean13
export type Pin575 = Assert<
  Eq<
    NonNullable<NonNullable<NonNullable<NonNullable<T.ParcelPutRequestBody>['contentsItems']>[number]>['gender']>,
    string
  >
>; // ParcelPutRequestBody.contentsItems[].gender
export type Pin576 = Assert<
  Eq<
    NonNullable<
      NonNullable<NonNullable<NonNullable<T.ParcelPutRequestBody>['contentsItems']>[number]>['valueReceiverCurrency']
    >,
    string
  >
>; // ParcelPutRequestBody.contentsItems[].valueReceiverCurrency
export type Pin577 = Assert<
  Eq<keyof NonNullable<NonNullable<NonNullable<T.ParcelPutRequestBody>['codPaymentsItems']>[number]>, 'agentId' | 'cod'>
>; // ParcelPutRequestBody.codPaymentsItems[] keys
export type Pin578 = Assert<
  Eq<Req<NonNullable<NonNullable<NonNullable<T.ParcelPutRequestBody>['codPaymentsItems']>[number]>>, 'agentId' | 'cod'>
>; // ParcelPutRequestBody.codPaymentsItems[] required
export type Pin579 = Assert<
  Eq<
    NonNullable<NonNullable<NonNullable<NonNullable<T.ParcelPutRequestBody>['codPaymentsItems']>[number]>['agentId']>,
    string
  >
>; // ParcelPutRequestBody.codPaymentsItems[].agentId
export type Pin580 = Assert<
  Eq<
    NonNullable<NonNullable<NonNullable<NonNullable<T.ParcelPutRequestBody>['codPaymentsItems']>[number]>['cod']>,
    number
  >
>; // ParcelPutRequestBody.codPaymentsItems[].cod
export type Pin581 = Assert<
  Eq<
    keyof NonNullable<NonNullable<NonNullable<T.ParcelPutRequestBody>['goods']>[number]>,
    'article' | 'name' | 'serialNumber' | 'weight' | 'quantity' | 'price' | 'length' | 'width' | 'height'
  >
>; // ParcelPutRequestBody.goods[] keys
export type Pin582 = Assert<
  Eq<
    Req<NonNullable<NonNullable<NonNullable<T.ParcelPutRequestBody>['goods']>[number]>>,
    'article' | 'name' | 'weight' | 'quantity' | 'price'
  >
>; // ParcelPutRequestBody.goods[] required
export type Pin583 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<NonNullable<T.ParcelPutRequestBody>['goods']>[number]>['article']>, string>
>; // ParcelPutRequestBody.goods[].article
export type Pin584 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<NonNullable<T.ParcelPutRequestBody>['goods']>[number]>['name']>, string>
>; // ParcelPutRequestBody.goods[].name
export type Pin585 = Assert<
  Eq<
    NonNullable<NonNullable<NonNullable<NonNullable<T.ParcelPutRequestBody>['goods']>[number]>['serialNumber']>,
    string
  >
>; // ParcelPutRequestBody.goods[].serialNumber
export type Pin586 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<NonNullable<T.ParcelPutRequestBody>['goods']>[number]>['weight']>, number>
>; // ParcelPutRequestBody.goods[].weight
export type Pin587 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<NonNullable<T.ParcelPutRequestBody>['goods']>[number]>['quantity']>, number>
>; // ParcelPutRequestBody.goods[].quantity
export type Pin588 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<NonNullable<T.ParcelPutRequestBody>['goods']>[number]>['price']>, number>
>; // ParcelPutRequestBody.goods[].price
export type Pin589 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<NonNullable<T.ParcelPutRequestBody>['goods']>[number]>['length']>, number>
>; // ParcelPutRequestBody.goods[].length
export type Pin590 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<NonNullable<T.ParcelPutRequestBody>['goods']>[number]>['width']>, number>
>; // ParcelPutRequestBody.goods[].width
export type Pin591 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<NonNullable<T.ParcelPutRequestBody>['goods']>[number]>['height']>, number>
>; // ParcelPutRequestBody.goods[].height
export type Pin592 = Assert<
  Eq<keyof NonNullable<NonNullable<T.ParcelPutRequestBody>['cardForCOD']>, 'number' | 'ownername' | 'ownermobile'>
>; // ParcelPutRequestBody.cardForCOD keys
export type Pin593 = Assert<
  Eq<Req<NonNullable<NonNullable<T.ParcelPutRequestBody>['cardForCOD']>>, 'number' | 'ownermobile'>
>; // ParcelPutRequestBody.cardForCOD required
export type Pin594 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<T.ParcelPutRequestBody>['cardForCOD']>['number']>, string>
>; // ParcelPutRequestBody.cardForCOD.number
export type Pin595 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<T.ParcelPutRequestBody>['cardForCOD']>['ownername']>, string>
>; // ParcelPutRequestBody.cardForCOD.ownername
export type Pin596 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<T.ParcelPutRequestBody>['cardForCOD']>['ownermobile']>, string>
>; // ParcelPutRequestBody.cardForCOD.ownermobile
export type Pin597 = Assert<Eq<keyof T.ParcelPutPathParams, 'parcelID'>>; // ParcelPutPathParams keys
export type Pin598 = Assert<Eq<Req<T.ParcelPutPathParams>, 'parcelID'>>; // ParcelPutPathParams required
export type Pin599 = Assert<Eq<NonNullable<T.ParcelPutPathParams['parcelID']>, string>>; // ParcelPutPathParams.parcelID
export type Pin600 = Assert<
  Eq<keyof NonNullable<T.ParcelPutResult>, 'parcelID' | 'barCode' | 'costOfServices' | 'estimatedDeliveryDate'>
>; // ParcelPutResult keys
export type Pin601 = Assert<Eq<Req<NonNullable<T.ParcelPutResult>>, never>>; // ParcelPutResult required
export type Pin602 = Assert<Eq<NonNullable<NonNullable<T.ParcelPutResult>['parcelID']>, string>>; // ParcelPutResult.parcelID
export type Pin603 = Assert<Eq<NonNullable<NonNullable<T.ParcelPutResult>['barCode']>, string>>; // ParcelPutResult.barCode
export type Pin604 = Assert<Eq<NonNullable<NonNullable<T.ParcelPutResult>['costOfServices']>, number>>; // ParcelPutResult.costOfServices
export type Pin605 = Assert<Eq<NonNullable<NonNullable<T.ParcelPutResult>['estimatedDeliveryDate']>, string>>; // ParcelPutResult.estimatedDeliveryDate
export type Pin606 = Assert<Eq<keyof T.ParcelsListPathParams, 'dateFrom'>>; // ParcelsListPathParams keys
export type Pin607 = Assert<Eq<Req<T.ParcelsListPathParams>, 'dateFrom'>>; // ParcelsListPathParams required
export type Pin608 = Assert<Eq<NonNullable<T.ParcelsListPathParams['dateFrom']>, string>>; // ParcelsListPathParams.dateFrom
export type Pin609 = Assert<
  Eq<
    keyof NonNullable<NonNullable<T.ParcelsListResult>[number]>,
    'parcelID' | 'parcelNumber' | '\u0432arCode' | 'registerID' | 'registerType'
  >
>; // ParcelsListResult[] keys
export type Pin610 = Assert<Eq<Req<NonNullable<NonNullable<T.ParcelsListResult>[number]>>, never>>; // ParcelsListResult[] required
export type Pin611 = Assert<Eq<NonNullable<NonNullable<NonNullable<T.ParcelsListResult>[number]>['parcelID']>, string>>; // ParcelsListResult[].parcelID
export type Pin612 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<T.ParcelsListResult>[number]>['parcelNumber']>, string>
>; // ParcelsListResult[].parcelNumber
export type Pin613 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<T.ParcelsListResult>[number]>['\u0432arCode']>, string>
>; // ParcelsListResult[].\u0432arCode
export type Pin614 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<T.ParcelsListResult>[number]>['registerID']>, string>
>; // ParcelsListResult[].registerID
export type Pin615 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<T.ParcelsListResult>[number]>['registerType']>, string>
>; // ParcelsListResult[].registerType
export type Pin616 = Assert<Eq<keyof T.ParcelStatusPathParams, 'parcelID'>>; // ParcelStatusPathParams keys
export type Pin617 = Assert<Eq<Req<T.ParcelStatusPathParams>, 'parcelID'>>; // ParcelStatusPathParams required
export type Pin618 = Assert<Eq<NonNullable<T.ParcelStatusPathParams['parcelID']>, string>>; // ParcelStatusPathParams.parcelID
export type Pin619 = Assert<
  Eq<keyof NonNullable<NonNullable<T.ParcelStatusResult>[number]>, 'status' | 'statusCode' | 'date'>
>; // ParcelStatusResult[] keys
export type Pin620 = Assert<Eq<Req<NonNullable<NonNullable<T.ParcelStatusResult>[number]>>, never>>; // ParcelStatusResult[] required
export type Pin621 = Assert<Eq<NonNullable<NonNullable<NonNullable<T.ParcelStatusResult>[number]>['status']>, string>>; // ParcelStatusResult[].status
export type Pin622 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<T.ParcelStatusResult>[number]>['statusCode']>, string>
>; // ParcelStatusResult[].statusCode
export type Pin623 = Assert<Eq<NonNullable<NonNullable<NonNullable<T.ParcelStatusResult>[number]>['date']>, string>>; // ParcelStatusResult[].date
export type Pin624 = Assert<Eq<keyof T.ParcelStatusDetailsPathParams, 'parcelID'>>; // ParcelStatusDetailsPathParams keys
export type Pin625 = Assert<Eq<Req<T.ParcelStatusDetailsPathParams>, 'parcelID'>>; // ParcelStatusDetailsPathParams required
export type Pin626 = Assert<Eq<NonNullable<T.ParcelStatusDetailsPathParams['parcelID']>, string>>; // ParcelStatusDetailsPathParams.parcelID
export type Pin627 = Assert<
  Eq<
    keyof NonNullable<T.ParcelStatusDetailsResult>,
    | 'parcelNumber'
    | 'parcelCode'
    | 'senderBranch'
    | 'senderBranchNumber'
    | 'receiverBranch'
    | 'receiverBranchNumber'
    | 'senderBranchTMO'
    | 'senderBranchTMONumber'
    | 'receiverBranchTMO'
    | 'receiverBranchTMONumber'
    | 'senderService'
    | 'receiverService'
    | 'statuses'
  >
>; // ParcelStatusDetailsResult keys
export type Pin628 = Assert<Eq<Req<NonNullable<T.ParcelStatusDetailsResult>>, never>>; // ParcelStatusDetailsResult required
export type Pin629 = Assert<Eq<NonNullable<NonNullable<T.ParcelStatusDetailsResult>['parcelNumber']>, string>>; // ParcelStatusDetailsResult.parcelNumber
export type Pin630 = Assert<Eq<NonNullable<NonNullable<T.ParcelStatusDetailsResult>['parcelCode']>, string>>; // ParcelStatusDetailsResult.parcelCode
export type Pin631 = Assert<Eq<NonNullable<NonNullable<T.ParcelStatusDetailsResult>['senderBranch']>, string>>; // ParcelStatusDetailsResult.senderBranch
export type Pin632 = Assert<Eq<NonNullable<NonNullable<T.ParcelStatusDetailsResult>['senderBranchNumber']>, string>>; // ParcelStatusDetailsResult.senderBranchNumber
export type Pin633 = Assert<Eq<NonNullable<NonNullable<T.ParcelStatusDetailsResult>['receiverBranch']>, string>>; // ParcelStatusDetailsResult.receiverBranch
export type Pin634 = Assert<Eq<NonNullable<NonNullable<T.ParcelStatusDetailsResult>['receiverBranchNumber']>, string>>; // ParcelStatusDetailsResult.receiverBranchNumber
export type Pin635 = Assert<Eq<NonNullable<NonNullable<T.ParcelStatusDetailsResult>['senderBranchTMO']>, string>>; // ParcelStatusDetailsResult.senderBranchTMO
export type Pin636 = Assert<Eq<NonNullable<NonNullable<T.ParcelStatusDetailsResult>['senderBranchTMONumber']>, string>>; // ParcelStatusDetailsResult.senderBranchTMONumber
export type Pin637 = Assert<Eq<NonNullable<NonNullable<T.ParcelStatusDetailsResult>['receiverBranchTMO']>, string>>; // ParcelStatusDetailsResult.receiverBranchTMO
export type Pin638 = Assert<
  Eq<NonNullable<NonNullable<T.ParcelStatusDetailsResult>['receiverBranchTMONumber']>, string>
>; // ParcelStatusDetailsResult.receiverBranchTMONumber
export type Pin639 = Assert<Eq<NonNullable<NonNullable<T.ParcelStatusDetailsResult>['senderService']>, string>>; // ParcelStatusDetailsResult.senderService
export type Pin640 = Assert<Eq<NonNullable<NonNullable<T.ParcelStatusDetailsResult>['receiverService']>, string>>; // ParcelStatusDetailsResult.receiverService
export type Pin641 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<T.ParcelStatusDetailsResult>['statuses']>[number]>, string>
>; // ParcelStatusDetailsResult.statuses[]
export type Pin642 = Assert<
  Eq<keyof NonNullable<NonNullable<T.SpecConditionsResult>[number]>, 'conditionID' | 'conditionDescr'>
>; // SpecConditionsResult[] keys
export type Pin643 = Assert<Eq<Req<NonNullable<NonNullable<T.SpecConditionsResult>[number]>>, never>>; // SpecConditionsResult[] required
export type Pin644 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<T.SpecConditionsResult>[number]>['conditionID']>, string>
>; // SpecConditionsResult[].conditionID
export type Pin645 = Assert<
  Eq<
    keyof NonNullable<NonNullable<NonNullable<T.SpecConditionsResult>[number]>['conditionDescr']>,
    'descrUA' | 'descrRU' | 'descrEN'
  >
>; // SpecConditionsResult[].conditionDescr keys
export type Pin646 = Assert<
  Eq<Req<NonNullable<NonNullable<NonNullable<T.SpecConditionsResult>[number]>['conditionDescr']>>, never>
>; // SpecConditionsResult[].conditionDescr required
export type Pin647 = Assert<
  Eq<
    NonNullable<NonNullable<NonNullable<NonNullable<T.SpecConditionsResult>[number]>['conditionDescr']>['descrUA']>,
    string
  >
>; // SpecConditionsResult[].conditionDescr.descrUA
export type Pin648 = Assert<
  Eq<
    NonNullable<NonNullable<NonNullable<NonNullable<T.SpecConditionsResult>[number]>['conditionDescr']>['descrRU']>,
    string
  >
>; // SpecConditionsResult[].conditionDescr.descrRU
export type Pin649 = Assert<
  Eq<
    NonNullable<NonNullable<NonNullable<NonNullable<T.SpecConditionsResult>[number]>['conditionDescr']>['descrEN']>,
    string
  >
>; // SpecConditionsResult[].conditionDescr.descrEN
export type Pin650 = Assert<
  Eq<
    keyof NonNullable<T.UnlockParcelRequestBody>,
    'ClientUID' | 'ClientsShipmentRef' | 'ParcelUID' | 'AppName' | 'Notation'
  >
>; // UnlockParcelRequestBody keys
export type Pin651 = Assert<Eq<Req<NonNullable<T.UnlockParcelRequestBody>>, 'ClientsShipmentRef'>>; // UnlockParcelRequestBody required
export type Pin652 = Assert<Eq<NonNullable<NonNullable<T.UnlockParcelRequestBody>['ClientUID']>, string>>; // UnlockParcelRequestBody.ClientUID
export type Pin653 = Assert<Eq<NonNullable<NonNullable<T.UnlockParcelRequestBody>['ClientsShipmentRef']>, string>>; // UnlockParcelRequestBody.ClientsShipmentRef
export type Pin654 = Assert<Eq<NonNullable<NonNullable<T.UnlockParcelRequestBody>['ParcelUID']>, string>>; // UnlockParcelRequestBody.ParcelUID
export type Pin655 = Assert<Eq<NonNullable<NonNullable<T.UnlockParcelRequestBody>['AppName']>, string>>; // UnlockParcelRequestBody.AppName
export type Pin656 = Assert<Eq<NonNullable<NonNullable<T.UnlockParcelRequestBody>['Notation']>, string>>; // UnlockParcelRequestBody.Notation
export type Pin657 = Assert<Eq<keyof T.Cn23FormPathParams, 'printValue' | 'phone'>>; // Cn23FormPathParams keys
export type Pin658 = Assert<Eq<Req<T.Cn23FormPathParams>, 'printValue' | 'phone'>>; // Cn23FormPathParams required
export type Pin659 = Assert<Eq<NonNullable<T.Cn23FormPathParams['printValue']>, string>>; // Cn23FormPathParams.printValue
export type Pin660 = Assert<Eq<NonNullable<T.Cn23FormPathParams['phone']>, string>>; // Cn23FormPathParams.phone
export type Pin661 = Assert<Eq<keyof T.DeclarationFormPathParams, 'printValue' | 'phone' | 'contentType'>>; // DeclarationFormPathParams keys
export type Pin662 = Assert<Eq<Req<T.DeclarationFormPathParams>, 'printValue' | 'phone' | 'contentType'>>; // DeclarationFormPathParams required
export type Pin663 = Assert<Eq<NonNullable<T.DeclarationFormPathParams['printValue']>, string>>; // DeclarationFormPathParams.printValue
export type Pin664 = Assert<Eq<NonNullable<T.DeclarationFormPathParams['phone']>, string>>; // DeclarationFormPathParams.phone
export type Pin665 = Assert<Eq<NonNullable<T.DeclarationFormPathParams['contentType']>, string>>; // DeclarationFormPathParams.contentType
export type Pin666 = Assert<Eq<keyof T.RegisterPathParams, 'printValue' | 'contentType'>>; // RegisterPathParams keys
export type Pin667 = Assert<Eq<Req<T.RegisterPathParams>, 'printValue' | 'contentType'>>; // RegisterPathParams required
export type Pin668 = Assert<Eq<NonNullable<T.RegisterPathParams['printValue']>, string>>; // RegisterPathParams.printValue
export type Pin669 = Assert<Eq<NonNullable<T.RegisterPathParams['contentType']>, string>>; // RegisterPathParams.contentType
export type Pin670 = Assert<Eq<keyof T.Sticker100QueryParams, 'agent' | 'page'>>; // Sticker100QueryParams keys
export type Pin671 = Assert<Eq<Req<T.Sticker100QueryParams>, never>>; // Sticker100QueryParams required
export type Pin672 = Assert<Eq<NonNullable<T.Sticker100QueryParams['agent']>, string>>; // Sticker100QueryParams.agent
export type Pin673 = Assert<Eq<NonNullable<T.Sticker100QueryParams['page']>, number>>; // Sticker100QueryParams.page
export type Pin674 = Assert<Eq<keyof T.Sticker100PathParams, 'printValue'>>; // Sticker100PathParams keys
export type Pin675 = Assert<Eq<Req<T.Sticker100PathParams>, 'printValue'>>; // Sticker100PathParams required
export type Pin676 = Assert<Eq<NonNullable<T.Sticker100PathParams['printValue']>, string>>; // Sticker100PathParams.printValue
export type Pin677 = Assert<Eq<keyof T.Sticker100A4QueryParams, 'position'>>; // Sticker100A4QueryParams keys
export type Pin678 = Assert<Eq<Req<T.Sticker100A4QueryParams>, never>>; // Sticker100A4QueryParams required
export type Pin679 = Assert<Eq<NonNullable<T.Sticker100A4QueryParams['position']>, string>>; // Sticker100A4QueryParams.position
export type Pin680 = Assert<Eq<keyof T.Sticker100A4PathParams, 'printValue'>>; // Sticker100A4PathParams keys
export type Pin681 = Assert<Eq<Req<T.Sticker100A4PathParams>, 'printValue'>>; // Sticker100A4PathParams required
export type Pin682 = Assert<Eq<NonNullable<T.Sticker100A4PathParams['printValue']>, string>>; // Sticker100A4PathParams.printValue
export type Pin683 = Assert<Eq<keyof T.AvailableTimeSlotsQueryParams, 'cityID' | 'streetID' | 'type'>>; // AvailableTimeSlotsQueryParams keys
export type Pin684 = Assert<Eq<Req<T.AvailableTimeSlotsQueryParams>, 'type'>>; // AvailableTimeSlotsQueryParams required
export type Pin685 = Assert<Eq<NonNullable<T.AvailableTimeSlotsQueryParams['cityID']>, string>>; // AvailableTimeSlotsQueryParams.cityID
export type Pin686 = Assert<Eq<NonNullable<T.AvailableTimeSlotsQueryParams['streetID']>, string>>; // AvailableTimeSlotsQueryParams.streetID
export type Pin687 = Assert<Eq<NonNullable<T.AvailableTimeSlotsQueryParams['type']>, string>>; // AvailableTimeSlotsQueryParams.type
export type Pin688 = Assert<
  Eq<keyof NonNullable<T.AvailableTimeSlotsResult>, 'zone' | 'availableTimeSlots' | 'availableDates'>
>; // AvailableTimeSlotsResult keys
export type Pin689 = Assert<Eq<Req<NonNullable<T.AvailableTimeSlotsResult>>, never>>; // AvailableTimeSlotsResult required
export type Pin690 = Assert<Eq<NonNullable<NonNullable<T.AvailableTimeSlotsResult>['zone']>, string>>; // AvailableTimeSlotsResult.zone
export type Pin691 = Assert<
  Eq<
    keyof NonNullable<NonNullable<NonNullable<T.AvailableTimeSlotsResult>['availableTimeSlots']>[number]>,
    'ID' | 'type' | 'timeFrom' | 'timeTo' | 'availableToday'
  >
>; // AvailableTimeSlotsResult.availableTimeSlots[] keys
export type Pin692 = Assert<
  Eq<Req<NonNullable<NonNullable<NonNullable<T.AvailableTimeSlotsResult>['availableTimeSlots']>[number]>>, never>
>; // AvailableTimeSlotsResult.availableTimeSlots[] required
export type Pin693 = Assert<
  Eq<
    NonNullable<NonNullable<NonNullable<NonNullable<T.AvailableTimeSlotsResult>['availableTimeSlots']>[number]>['ID']>,
    string
  >
>; // AvailableTimeSlotsResult.availableTimeSlots[].ID
export type Pin694 = Assert<
  Eq<
    NonNullable<
      NonNullable<NonNullable<NonNullable<T.AvailableTimeSlotsResult>['availableTimeSlots']>[number]>['type']
    >,
    string
  >
>; // AvailableTimeSlotsResult.availableTimeSlots[].type
export type Pin695 = Assert<
  Eq<
    NonNullable<
      NonNullable<NonNullable<NonNullable<T.AvailableTimeSlotsResult>['availableTimeSlots']>[number]>['timeFrom']
    >,
    string
  >
>; // AvailableTimeSlotsResult.availableTimeSlots[].timeFrom
export type Pin696 = Assert<
  Eq<
    NonNullable<
      NonNullable<NonNullable<NonNullable<T.AvailableTimeSlotsResult>['availableTimeSlots']>[number]>['timeTo']
    >,
    string
  >
>; // AvailableTimeSlotsResult.availableTimeSlots[].timeTo
export type Pin697 = Assert<
  Eq<
    NonNullable<
      NonNullable<NonNullable<NonNullable<T.AvailableTimeSlotsResult>['availableTimeSlots']>[number]>['availableToday']
    >,
    boolean
  >
>; // AvailableTimeSlotsResult.availableTimeSlots[].availableToday
export type Pin698 = Assert<
  Eq<
    keyof NonNullable<NonNullable<NonNullable<T.AvailableTimeSlotsResult>['availableDates']>[number]>,
    'date' | 'isAvailable'
  >
>; // AvailableTimeSlotsResult.availableDates[] keys
export type Pin699 = Assert<
  Eq<Req<NonNullable<NonNullable<NonNullable<T.AvailableTimeSlotsResult>['availableDates']>[number]>>, never>
>; // AvailableTimeSlotsResult.availableDates[] required
export type Pin700 = Assert<
  Eq<
    NonNullable<NonNullable<NonNullable<NonNullable<T.AvailableTimeSlotsResult>['availableDates']>[number]>['date']>,
    string
  >
>; // AvailableTimeSlotsResult.availableDates[].date
export type Pin701 = Assert<
  Eq<
    NonNullable<
      NonNullable<NonNullable<NonNullable<T.AvailableTimeSlotsResult>['availableDates']>[number]>['isAvailable']
    >,
    boolean
  >
>; // AvailableTimeSlotsResult.availableDates[].isAvailable
export type Pin702 = Assert<
  Eq<keyof NonNullable<T.RegisterBranchRequestBody>, 'notation' | 'contractID' | 'parcelsItems'>
>; // RegisterBranchRequestBody keys
export type Pin703 = Assert<Eq<Req<NonNullable<T.RegisterBranchRequestBody>>, never>>; // RegisterBranchRequestBody required
export type Pin704 = Assert<Eq<NonNullable<NonNullable<T.RegisterBranchRequestBody>['notation']>, string>>; // RegisterBranchRequestBody.notation
export type Pin705 = Assert<Eq<NonNullable<NonNullable<T.RegisterBranchRequestBody>['contractID']>, string>>; // RegisterBranchRequestBody.contractID
export type Pin706 = Assert<
  Eq<keyof NonNullable<NonNullable<NonNullable<T.RegisterBranchRequestBody>['parcelsItems']>[number]>, 'parcelID'>
>; // RegisterBranchRequestBody.parcelsItems[] keys
export type Pin707 = Assert<
  Eq<Req<NonNullable<NonNullable<NonNullable<T.RegisterBranchRequestBody>['parcelsItems']>[number]>>, 'parcelID'>
>; // RegisterBranchRequestBody.parcelsItems[] required
export type Pin708 = Assert<
  Eq<
    NonNullable<NonNullable<NonNullable<NonNullable<T.RegisterBranchRequestBody>['parcelsItems']>[number]>['parcelID']>,
    string
  >
>; // RegisterBranchRequestBody.parcelsItems[].parcelID
export type Pin709 = Assert<
  Eq<keyof NonNullable<T.RegisterBranchResult>, 'registerID' | 'registerNumber' | 'Not_added_to_registry'>
>; // RegisterBranchResult keys
export type Pin710 = Assert<Eq<Req<NonNullable<T.RegisterBranchResult>>, never>>; // RegisterBranchResult required
export type Pin711 = Assert<Eq<NonNullable<NonNullable<T.RegisterBranchResult>['registerID']>, string>>; // RegisterBranchResult.registerID
export type Pin712 = Assert<Eq<NonNullable<NonNullable<T.RegisterBranchResult>['registerNumber']>, string>>; // RegisterBranchResult.registerNumber
export type Pin713 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<T.RegisterBranchResult>['Not_added_to_registry']>[number]>, string>
>; // RegisterBranchResult.Not_added_to_registry[]
export type Pin714 = Assert<Eq<keyof T.RegisterBranchDeletePathParams, 'registerID'>>; // RegisterBranchDeletePathParams keys
export type Pin715 = Assert<Eq<Req<T.RegisterBranchDeletePathParams>, 'registerID'>>; // RegisterBranchDeletePathParams required
export type Pin716 = Assert<Eq<NonNullable<T.RegisterBranchDeletePathParams['registerID']>, string>>; // RegisterBranchDeletePathParams.registerID
export type Pin717 = Assert<Eq<NonNullable<T.RegisterBranchDeleteResult>, Record<string, unknown>>>; // RegisterBranchDeleteResult
export type Pin718 = Assert<
  Eq<keyof NonNullable<T.RegisterBranchPutRequestBody>, 'notation' | 'contractID' | 'parcelsItems'>
>; // RegisterBranchPutRequestBody keys
export type Pin719 = Assert<Eq<Req<NonNullable<T.RegisterBranchPutRequestBody>>, never>>; // RegisterBranchPutRequestBody required
export type Pin720 = Assert<Eq<NonNullable<NonNullable<T.RegisterBranchPutRequestBody>['notation']>, string>>; // RegisterBranchPutRequestBody.notation
export type Pin721 = Assert<Eq<NonNullable<NonNullable<T.RegisterBranchPutRequestBody>['contractID']>, string>>; // RegisterBranchPutRequestBody.contractID
export type Pin722 = Assert<
  Eq<keyof NonNullable<NonNullable<NonNullable<T.RegisterBranchPutRequestBody>['parcelsItems']>[number]>, 'parcelID'>
>; // RegisterBranchPutRequestBody.parcelsItems[] keys
export type Pin723 = Assert<
  Eq<Req<NonNullable<NonNullable<NonNullable<T.RegisterBranchPutRequestBody>['parcelsItems']>[number]>>, 'parcelID'>
>; // RegisterBranchPutRequestBody.parcelsItems[] required
export type Pin724 = Assert<
  Eq<
    NonNullable<
      NonNullable<NonNullable<NonNullable<T.RegisterBranchPutRequestBody>['parcelsItems']>[number]>['parcelID']
    >,
    string
  >
>; // RegisterBranchPutRequestBody.parcelsItems[].parcelID
export type Pin725 = Assert<Eq<keyof T.RegisterBranchPutPathParams, 'registerID'>>; // RegisterBranchPutPathParams keys
export type Pin726 = Assert<Eq<Req<T.RegisterBranchPutPathParams>, 'registerID'>>; // RegisterBranchPutPathParams required
export type Pin727 = Assert<Eq<NonNullable<T.RegisterBranchPutPathParams['registerID']>, string>>; // RegisterBranchPutPathParams.registerID
export type Pin728 = Assert<Eq<keyof NonNullable<T.RegisterBranchPutResult>, 'registerID' | 'registerNumber'>>; // RegisterBranchPutResult keys
export type Pin729 = Assert<Eq<Req<NonNullable<T.RegisterBranchPutResult>>, never>>; // RegisterBranchPutResult required
export type Pin730 = Assert<Eq<NonNullable<NonNullable<T.RegisterBranchPutResult>['registerID']>, string>>; // RegisterBranchPutResult.registerID
export type Pin731 = Assert<Eq<NonNullable<NonNullable<T.RegisterBranchPutResult>['registerNumber']>, string>>; // RegisterBranchPutResult.registerNumber
export type Pin732 = Assert<
  Eq<
    keyof NonNullable<T.RegisterPickupRequestBody>,
    | 'notation'
    | 'contractID'
    | 'payType'
    | 'receiverPay'
    | 'multiParcelPickup'
    | 'expectedPickUpDate'
    | 'sender'
    | 'parcelsItems'
  >
>; // RegisterPickupRequestBody keys
export type Pin733 = Assert<Eq<Req<NonNullable<T.RegisterPickupRequestBody>>, 'payType'>>; // RegisterPickupRequestBody required
export type Pin734 = Assert<Eq<NonNullable<NonNullable<T.RegisterPickupRequestBody>['notation']>, string>>; // RegisterPickupRequestBody.notation
export type Pin735 = Assert<Eq<NonNullable<NonNullable<T.RegisterPickupRequestBody>['contractID']>, string>>; // RegisterPickupRequestBody.contractID
export type Pin736 = Assert<Eq<NonNullable<NonNullable<T.RegisterPickupRequestBody>['payType']>, string>>; // RegisterPickupRequestBody.payType
export type Pin737 = Assert<Eq<NonNullable<NonNullable<T.RegisterPickupRequestBody>['receiverPay']>, boolean>>; // RegisterPickupRequestBody.receiverPay
export type Pin738 = Assert<Eq<NonNullable<NonNullable<T.RegisterPickupRequestBody>['multiParcelPickup']>, boolean>>; // RegisterPickupRequestBody.multiParcelPickup
export type Pin739 = Assert<
  Eq<keyof NonNullable<NonNullable<T.RegisterPickupRequestBody>['expectedPickUpDate']>, 'date' | 'timeFrom' | 'timeTo'>
>; // RegisterPickupRequestBody.expectedPickUpDate keys
export type Pin740 = Assert<
  Eq<Req<NonNullable<NonNullable<T.RegisterPickupRequestBody>['expectedPickUpDate']>>, 'date' | 'timeFrom' | 'timeTo'>
>; // RegisterPickupRequestBody.expectedPickUpDate required
export type Pin741 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<T.RegisterPickupRequestBody>['expectedPickUpDate']>['date']>, string>
>; // RegisterPickupRequestBody.expectedPickUpDate.date
export type Pin742 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<T.RegisterPickupRequestBody>['expectedPickUpDate']>['timeFrom']>, string>
>; // RegisterPickupRequestBody.expectedPickUpDate.timeFrom
export type Pin743 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<T.RegisterPickupRequestBody>['expectedPickUpDate']>['timeTo']>, string>
>; // RegisterPickupRequestBody.expectedPickUpDate.timeTo
export type Pin744 = Assert<
  Eq<
    keyof NonNullable<NonNullable<T.RegisterPickupRequestBody>['sender']>,
    'name' | 'phone' | 'addressID' | 'building' | 'flat' | 'floor'
  >
>; // RegisterPickupRequestBody.sender keys
export type Pin745 = Assert<
  Eq<Req<NonNullable<NonNullable<T.RegisterPickupRequestBody>['sender']>>, 'name' | 'phone' | 'addressID' | 'building'>
>; // RegisterPickupRequestBody.sender required
export type Pin746 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<T.RegisterPickupRequestBody>['sender']>['name']>, string>
>; // RegisterPickupRequestBody.sender.name
export type Pin747 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<T.RegisterPickupRequestBody>['sender']>['phone']>, string>
>; // RegisterPickupRequestBody.sender.phone
export type Pin748 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<T.RegisterPickupRequestBody>['sender']>['addressID']>, string>
>; // RegisterPickupRequestBody.sender.addressID
export type Pin749 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<T.RegisterPickupRequestBody>['sender']>['building']>, string>
>; // RegisterPickupRequestBody.sender.building
export type Pin750 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<T.RegisterPickupRequestBody>['sender']>['flat']>, string>
>; // RegisterPickupRequestBody.sender.flat
export type Pin751 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<T.RegisterPickupRequestBody>['sender']>['floor']>, string>
>; // RegisterPickupRequestBody.sender.floor
export type Pin752 = Assert<
  Eq<keyof NonNullable<NonNullable<NonNullable<T.RegisterPickupRequestBody>['parcelsItems']>[number]>, 'parcelID'>
>; // RegisterPickupRequestBody.parcelsItems[] keys
export type Pin753 = Assert<
  Eq<Req<NonNullable<NonNullable<NonNullable<T.RegisterPickupRequestBody>['parcelsItems']>[number]>>, 'parcelID'>
>; // RegisterPickupRequestBody.parcelsItems[] required
export type Pin754 = Assert<
  Eq<
    NonNullable<NonNullable<NonNullable<NonNullable<T.RegisterPickupRequestBody>['parcelsItems']>[number]>['parcelID']>,
    string
  >
>; // RegisterPickupRequestBody.parcelsItems[].parcelID
export type Pin755 = Assert<
  Eq<
    keyof NonNullable<T.RegisterPickupResult>,
    | 'registerID'
    | 'registerNumber'
    | 'pickUpDate'
    | 'multiParcelPickup'
    | 'multiParcelPickupCost'
    | 'parcelsWithPostedMultiPickup'
    | 'parcelsWithPostedPickup'
  >
>; // RegisterPickupResult keys
export type Pin756 = Assert<Eq<Req<NonNullable<T.RegisterPickupResult>>, never>>; // RegisterPickupResult required
export type Pin757 = Assert<Eq<NonNullable<NonNullable<T.RegisterPickupResult>['registerID']>, string>>; // RegisterPickupResult.registerID
export type Pin758 = Assert<Eq<NonNullable<NonNullable<T.RegisterPickupResult>['registerNumber']>, string>>; // RegisterPickupResult.registerNumber
export type Pin759 = Assert<Eq<NonNullable<NonNullable<T.RegisterPickupResult>['pickUpDate']>, string>>; // RegisterPickupResult.pickUpDate
export type Pin760 = Assert<Eq<NonNullable<NonNullable<T.RegisterPickupResult>['multiParcelPickup']>, boolean>>; // RegisterPickupResult.multiParcelPickup
export type Pin761 = Assert<Eq<NonNullable<NonNullable<T.RegisterPickupResult>['multiParcelPickupCost']>, number>>; // RegisterPickupResult.multiParcelPickupCost
export type Pin762 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<T.RegisterPickupResult>['parcelsWithPostedMultiPickup']>[number]>, string>
>; // RegisterPickupResult.parcelsWithPostedMultiPickup[]
export type Pin763 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<T.RegisterPickupResult>['parcelsWithPostedPickup']>[number]>, string>
>; // RegisterPickupResult.parcelsWithPostedPickup[]
export type Pin764 = Assert<Eq<keyof T.RegisterPickupDeletePathParams, 'registerID'>>; // RegisterPickupDeletePathParams keys
export type Pin765 = Assert<Eq<Req<T.RegisterPickupDeletePathParams>, 'registerID'>>; // RegisterPickupDeletePathParams required
export type Pin766 = Assert<Eq<NonNullable<T.RegisterPickupDeletePathParams['registerID']>, string>>; // RegisterPickupDeletePathParams.registerID
export type Pin767 = Assert<Eq<NonNullable<T.RegisterPickupDeleteResult>, Record<string, unknown>>>; // RegisterPickupDeleteResult
export type Pin768 = Assert<
  Eq<
    keyof NonNullable<T.RegisterPickupPutRequestBody>,
    'notation' | 'contractID' | 'Edit' | 'payType' | 'receiverPay' | 'expectedPickUpDate' | 'sender' | 'parcelsItems'
  >
>; // RegisterPickupPutRequestBody keys
export type Pin769 = Assert<Eq<Req<NonNullable<T.RegisterPickupPutRequestBody>>, 'payType' | 'receiverPay'>>; // RegisterPickupPutRequestBody required
export type Pin770 = Assert<Eq<NonNullable<NonNullable<T.RegisterPickupPutRequestBody>['notation']>, string>>; // RegisterPickupPutRequestBody.notation
export type Pin771 = Assert<Eq<NonNullable<NonNullable<T.RegisterPickupPutRequestBody>['contractID']>, string>>; // RegisterPickupPutRequestBody.contractID
export type Pin772 = Assert<Eq<NonNullable<NonNullable<T.RegisterPickupPutRequestBody>['Edit']>, boolean>>; // RegisterPickupPutRequestBody.Edit
export type Pin773 = Assert<Eq<NonNullable<NonNullable<T.RegisterPickupPutRequestBody>['payType']>, string>>; // RegisterPickupPutRequestBody.payType
export type Pin774 = Assert<Eq<NonNullable<NonNullable<T.RegisterPickupPutRequestBody>['receiverPay']>, boolean>>; // RegisterPickupPutRequestBody.receiverPay
export type Pin775 = Assert<
  Eq<
    keyof NonNullable<NonNullable<T.RegisterPickupPutRequestBody>['expectedPickUpDate']>,
    'date' | 'timeFrom' | 'timeTo'
  >
>; // RegisterPickupPutRequestBody.expectedPickUpDate keys
export type Pin776 = Assert<
  Eq<
    Req<NonNullable<NonNullable<T.RegisterPickupPutRequestBody>['expectedPickUpDate']>>,
    'date' | 'timeFrom' | 'timeTo'
  >
>; // RegisterPickupPutRequestBody.expectedPickUpDate required
export type Pin777 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<T.RegisterPickupPutRequestBody>['expectedPickUpDate']>['date']>, string>
>; // RegisterPickupPutRequestBody.expectedPickUpDate.date
export type Pin778 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<T.RegisterPickupPutRequestBody>['expectedPickUpDate']>['timeFrom']>, string>
>; // RegisterPickupPutRequestBody.expectedPickUpDate.timeFrom
export type Pin779 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<T.RegisterPickupPutRequestBody>['expectedPickUpDate']>['timeTo']>, string>
>; // RegisterPickupPutRequestBody.expectedPickUpDate.timeTo
export type Pin780 = Assert<
  Eq<
    keyof NonNullable<NonNullable<T.RegisterPickupPutRequestBody>['sender']>,
    'name' | 'phone' | 'addressID' | 'building' | 'flat' | 'floor'
  >
>; // RegisterPickupPutRequestBody.sender keys
export type Pin781 = Assert<
  Eq<
    Req<NonNullable<NonNullable<T.RegisterPickupPutRequestBody>['sender']>>,
    'name' | 'phone' | 'addressID' | 'building'
  >
>; // RegisterPickupPutRequestBody.sender required
export type Pin782 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<T.RegisterPickupPutRequestBody>['sender']>['name']>, string>
>; // RegisterPickupPutRequestBody.sender.name
export type Pin783 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<T.RegisterPickupPutRequestBody>['sender']>['phone']>, string>
>; // RegisterPickupPutRequestBody.sender.phone
export type Pin784 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<T.RegisterPickupPutRequestBody>['sender']>['addressID']>, string>
>; // RegisterPickupPutRequestBody.sender.addressID
export type Pin785 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<T.RegisterPickupPutRequestBody>['sender']>['building']>, string>
>; // RegisterPickupPutRequestBody.sender.building
export type Pin786 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<T.RegisterPickupPutRequestBody>['sender']>['flat']>, string>
>; // RegisterPickupPutRequestBody.sender.flat
export type Pin787 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<T.RegisterPickupPutRequestBody>['sender']>['floor']>, string>
>; // RegisterPickupPutRequestBody.sender.floor
export type Pin788 = Assert<
  Eq<keyof NonNullable<NonNullable<NonNullable<T.RegisterPickupPutRequestBody>['parcelsItems']>[number]>, 'parcelID'>
>; // RegisterPickupPutRequestBody.parcelsItems[] keys
export type Pin789 = Assert<
  Eq<Req<NonNullable<NonNullable<NonNullable<T.RegisterPickupPutRequestBody>['parcelsItems']>[number]>>, 'parcelID'>
>; // RegisterPickupPutRequestBody.parcelsItems[] required
export type Pin790 = Assert<
  Eq<
    NonNullable<
      NonNullable<NonNullable<NonNullable<T.RegisterPickupPutRequestBody>['parcelsItems']>[number]>['parcelID']
    >,
    string
  >
>; // RegisterPickupPutRequestBody.parcelsItems[].parcelID
export type Pin791 = Assert<Eq<keyof T.RegisterPickupPutPathParams, 'registerID'>>; // RegisterPickupPutPathParams keys
export type Pin792 = Assert<Eq<Req<T.RegisterPickupPutPathParams>, 'registerID'>>; // RegisterPickupPutPathParams required
export type Pin793 = Assert<Eq<NonNullable<T.RegisterPickupPutPathParams['registerID']>, string>>; // RegisterPickupPutPathParams.registerID
export type Pin794 = Assert<
  Eq<keyof NonNullable<T.RegisterPickupPutResult>, 'registerID' | 'registerNumber' | 'pickUpDate'>
>; // RegisterPickupPutResult keys
export type Pin795 = Assert<Eq<Req<NonNullable<T.RegisterPickupPutResult>>, never>>; // RegisterPickupPutResult required
export type Pin796 = Assert<Eq<NonNullable<NonNullable<T.RegisterPickupPutResult>['registerID']>, string>>; // RegisterPickupPutResult.registerID
export type Pin797 = Assert<Eq<NonNullable<NonNullable<T.RegisterPickupPutResult>['registerNumber']>, string>>; // RegisterPickupPutResult.registerNumber
export type Pin798 = Assert<Eq<NonNullable<NonNullable<T.RegisterPickupPutResult>['pickUpDate']>, string>>; // RegisterPickupPutResult.pickUpDate
export type Pin799 = Assert<Eq<keyof T.RegistersListPathParams, 'dateFrom'>>; // RegistersListPathParams keys
export type Pin800 = Assert<Eq<Req<T.RegistersListPathParams>, 'dateFrom'>>; // RegistersListPathParams required
export type Pin801 = Assert<Eq<NonNullable<T.RegistersListPathParams['dateFrom']>, string>>; // RegistersListPathParams.dateFrom
export type Pin802 = Assert<
  Eq<keyof NonNullable<NonNullable<T.RegistersListResult>[number]>, 'registerID' | 'registerType' | 'parcelQty'>
>; // RegistersListResult[] keys
export type Pin803 = Assert<Eq<Req<NonNullable<NonNullable<T.RegistersListResult>[number]>>, never>>; // RegistersListResult[] required
export type Pin804 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<T.RegistersListResult>[number]>['registerID']>, string>
>; // RegistersListResult[].registerID
export type Pin805 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<T.RegistersListResult>[number]>['registerType']>, string>
>; // RegistersListResult[].registerType
export type Pin806 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<T.RegistersListResult>[number]>['parcelQty']>, number>
>; // RegistersListResult[].parcelQty
export type Pin807 = Assert<Eq<keyof NonNullable<T.AddressSearchRequestBody>, 'filters'>>; // AddressSearchRequestBody keys
export type Pin808 = Assert<Eq<Req<NonNullable<T.AddressSearchRequestBody>>, never>>; // AddressSearchRequestBody required
export type Pin809 = Assert<
  Eq<keyof NonNullable<NonNullable<T.AddressSearchRequestBody>['filters']>, 'cityID' | 'addressDescr' | 'addressID'>
>; // AddressSearchRequestBody.filters keys
export type Pin810 = Assert<Eq<Req<NonNullable<NonNullable<T.AddressSearchRequestBody>['filters']>>, never>>; // AddressSearchRequestBody.filters required
export type Pin811 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<T.AddressSearchRequestBody>['filters']>['cityID']>, string>
>; // AddressSearchRequestBody.filters.cityID
export type Pin812 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<T.AddressSearchRequestBody>['filters']>['addressDescr']>, string>
>; // AddressSearchRequestBody.filters.addressDescr
export type Pin813 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<T.AddressSearchRequestBody>['filters']>['addressID']>, string>
>; // AddressSearchRequestBody.filters.addressID
export type Pin814 = Assert<
  Eq<
    keyof NonNullable<NonNullable<T.AddressSearchResult>[number]>,
    'addressID' | 'addressDescr' | 'latitude' | 'longitude' | 'cityID' | 'viewCity' | 'cityDescr' | 'Localization'
  >
>; // AddressSearchResult[] keys
export type Pin815 = Assert<Eq<Req<NonNullable<NonNullable<T.AddressSearchResult>[number]>>, never>>; // AddressSearchResult[] required
export type Pin816 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<T.AddressSearchResult>[number]>['addressID']>, string>
>; // AddressSearchResult[].addressID
export type Pin817 = Assert<
  Eq<
    keyof NonNullable<NonNullable<NonNullable<T.AddressSearchResult>[number]>['addressDescr']>,
    'descrUA' | 'descrRU' | 'descrEN' | 'descrLoc'
  >
>; // AddressSearchResult[].addressDescr keys
export type Pin818 = Assert<
  Eq<Req<NonNullable<NonNullable<NonNullable<T.AddressSearchResult>[number]>['addressDescr']>>, never>
>; // AddressSearchResult[].addressDescr required
export type Pin819 = Assert<
  Eq<
    NonNullable<NonNullable<NonNullable<NonNullable<T.AddressSearchResult>[number]>['addressDescr']>['descrUA']>,
    string
  >
>; // AddressSearchResult[].addressDescr.descrUA
export type Pin820 = Assert<
  Eq<
    NonNullable<NonNullable<NonNullable<NonNullable<T.AddressSearchResult>[number]>['addressDescr']>['descrRU']>,
    string
  >
>; // AddressSearchResult[].addressDescr.descrRU
export type Pin821 = Assert<
  Eq<
    NonNullable<NonNullable<NonNullable<NonNullable<T.AddressSearchResult>[number]>['addressDescr']>['descrEN']>,
    string
  >
>; // AddressSearchResult[].addressDescr.descrEN
export type Pin822 = Assert<
  Eq<
    NonNullable<NonNullable<NonNullable<NonNullable<T.AddressSearchResult>[number]>['addressDescr']>['descrLoc']>,
    string
  >
>; // AddressSearchResult[].addressDescr.descrLoc
export type Pin823 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<T.AddressSearchResult>[number]>['latitude']>, number>
>; // AddressSearchResult[].latitude
export type Pin824 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<T.AddressSearchResult>[number]>['longitude']>, number>
>; // AddressSearchResult[].longitude
export type Pin825 = Assert<Eq<NonNullable<NonNullable<NonNullable<T.AddressSearchResult>[number]>['cityID']>, string>>; // AddressSearchResult[].cityID
export type Pin826 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<T.AddressSearchResult>[number]>['viewCity']>, string>
>; // AddressSearchResult[].viewCity
export type Pin827 = Assert<
  Eq<
    keyof NonNullable<NonNullable<NonNullable<T.AddressSearchResult>[number]>['cityDescr']>,
    'descrUA' | 'descrRU' | 'descrEN' | 'descrLoc'
  >
>; // AddressSearchResult[].cityDescr keys
export type Pin828 = Assert<
  Eq<Req<NonNullable<NonNullable<NonNullable<T.AddressSearchResult>[number]>['cityDescr']>>, never>
>; // AddressSearchResult[].cityDescr required
export type Pin829 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<NonNullable<T.AddressSearchResult>[number]>['cityDescr']>['descrUA']>, string>
>; // AddressSearchResult[].cityDescr.descrUA
export type Pin830 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<NonNullable<T.AddressSearchResult>[number]>['cityDescr']>['descrRU']>, string>
>; // AddressSearchResult[].cityDescr.descrRU
export type Pin831 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<NonNullable<T.AddressSearchResult>[number]>['cityDescr']>['descrEN']>, string>
>; // AddressSearchResult[].cityDescr.descrEN
export type Pin832 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<NonNullable<T.AddressSearchResult>[number]>['cityDescr']>['descrLoc']>, string>
>; // AddressSearchResult[].cityDescr.descrLoc
export type Pin833 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<T.AddressSearchResult>[number]>['Localization']>, string>
>; // AddressSearchResult[].Localization
export type Pin834 = Assert<Eq<keyof NonNullable<T.AddressSearchByCoordRequestBody>, 'lat' | 'lon'>>; // AddressSearchByCoordRequestBody keys
export type Pin835 = Assert<Eq<Req<NonNullable<T.AddressSearchByCoordRequestBody>>, 'lat' | 'lon'>>; // AddressSearchByCoordRequestBody required
export type Pin836 = Assert<Eq<NonNullable<NonNullable<T.AddressSearchByCoordRequestBody>['lat']>, number>>; // AddressSearchByCoordRequestBody.lat
export type Pin837 = Assert<Eq<NonNullable<NonNullable<T.AddressSearchByCoordRequestBody>['lon']>, number>>; // AddressSearchByCoordRequestBody.lon
export type Pin838 = Assert<
  Eq<keyof NonNullable<NonNullable<T.AddressSearchByCoordResult>[number]>, 'geoPoint' | 'address' | 'addressUID'>
>; // AddressSearchByCoordResult[] keys
export type Pin839 = Assert<Eq<Req<NonNullable<NonNullable<T.AddressSearchByCoordResult>[number]>>, never>>; // AddressSearchByCoordResult[] required
export type Pin840 = Assert<
  Eq<
    keyof NonNullable<NonNullable<NonNullable<T.AddressSearchByCoordResult>[number]>['geoPoint']>,
    'lat' | 'lon' | 'display_name'
  >
>; // AddressSearchByCoordResult[].geoPoint keys
export type Pin841 = Assert<
  Eq<Req<NonNullable<NonNullable<NonNullable<T.AddressSearchByCoordResult>[number]>['geoPoint']>>, never>
>; // AddressSearchByCoordResult[].geoPoint required
export type Pin842 = Assert<
  Eq<
    NonNullable<NonNullable<NonNullable<NonNullable<T.AddressSearchByCoordResult>[number]>['geoPoint']>['lat']>,
    string
  >
>; // AddressSearchByCoordResult[].geoPoint.lat
export type Pin843 = Assert<
  Eq<
    NonNullable<NonNullable<NonNullable<NonNullable<T.AddressSearchByCoordResult>[number]>['geoPoint']>['lon']>,
    string
  >
>; // AddressSearchByCoordResult[].geoPoint.lon
export type Pin844 = Assert<
  Eq<
    NonNullable<
      NonNullable<NonNullable<NonNullable<T.AddressSearchByCoordResult>[number]>['geoPoint']>['display_name']
    >,
    string
  >
>; // AddressSearchByCoordResult[].geoPoint.display_name
export type Pin845 = Assert<
  Eq<
    keyof NonNullable<NonNullable<NonNullable<T.AddressSearchByCoordResult>[number]>['address']>,
    'country' | 'postcode' | 'region' | 'city' | 'county'
  >
>; // AddressSearchByCoordResult[].address keys
export type Pin846 = Assert<
  Eq<Req<NonNullable<NonNullable<NonNullable<T.AddressSearchByCoordResult>[number]>['address']>>, never>
>; // AddressSearchByCoordResult[].address required
export type Pin847 = Assert<
  Eq<
    NonNullable<NonNullable<NonNullable<NonNullable<T.AddressSearchByCoordResult>[number]>['address']>['country']>,
    string
  >
>; // AddressSearchByCoordResult[].address.country
export type Pin848 = Assert<
  Eq<
    NonNullable<NonNullable<NonNullable<NonNullable<T.AddressSearchByCoordResult>[number]>['address']>['postcode']>,
    string
  >
>; // AddressSearchByCoordResult[].address.postcode
export type Pin849 = Assert<
  Eq<
    NonNullable<NonNullable<NonNullable<NonNullable<T.AddressSearchByCoordResult>[number]>['address']>['region']>,
    string
  >
>; // AddressSearchByCoordResult[].address.region
export type Pin850 = Assert<
  Eq<
    NonNullable<NonNullable<NonNullable<NonNullable<T.AddressSearchByCoordResult>[number]>['address']>['city']>,
    string
  >
>; // AddressSearchByCoordResult[].address.city
export type Pin851 = Assert<
  Eq<
    NonNullable<NonNullable<NonNullable<NonNullable<T.AddressSearchByCoordResult>[number]>['address']>['county']>,
    string
  >
>; // AddressSearchByCoordResult[].address.county
export type Pin852 = Assert<
  Eq<
    keyof NonNullable<NonNullable<NonNullable<T.AddressSearchByCoordResult>[number]>['addressUID']>,
    'UIDcity' | 'UIDstreet'
  >
>; // AddressSearchByCoordResult[].addressUID keys
export type Pin853 = Assert<
  Eq<Req<NonNullable<NonNullable<NonNullable<T.AddressSearchByCoordResult>[number]>['addressUID']>>, never>
>; // AddressSearchByCoordResult[].addressUID required
export type Pin854 = Assert<
  Eq<
    NonNullable<NonNullable<NonNullable<NonNullable<T.AddressSearchByCoordResult>[number]>['addressUID']>['UIDcity']>,
    string
  >
>; // AddressSearchByCoordResult[].addressUID.UIDcity
export type Pin855 = Assert<
  Eq<
    NonNullable<NonNullable<NonNullable<NonNullable<T.AddressSearchByCoordResult>[number]>['addressUID']>['UIDstreet']>,
    string
  >
>; // AddressSearchByCoordResult[].addressUID.UIDstreet
export type Pin856 = Assert<
  Eq<keyof NonNullable<T.BranchSearchRequestBody>, 'filters' | 'getCobranding' | '\u0441obrandingCode'>
>; // BranchSearchRequestBody keys
export type Pin857 = Assert<Eq<Req<NonNullable<T.BranchSearchRequestBody>>, never>>; // BranchSearchRequestBody required
export type Pin858 = Assert<
  Eq<
    keyof NonNullable<NonNullable<T.BranchSearchRequestBody>['filters']>,
    | 'branchID'
    | 'branchNumber'
    | 'branchNo'
    | 'branchTypeID'
    | 'branchDescr'
    | 'cityID'
    | 'cityDescr'
    | 'districtID'
    | 'districtDescr'
    | 'regionID'
    | 'regionDescr'
    | 'networkDepartment'
    | 'networkPartner'
    | 'networkPartnerCode'
    | 'addressMoreInformation'
  >
>; // BranchSearchRequestBody.filters keys
export type Pin859 = Assert<Eq<Req<NonNullable<NonNullable<T.BranchSearchRequestBody>['filters']>>, never>>; // BranchSearchRequestBody.filters required
export type Pin860 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<T.BranchSearchRequestBody>['filters']>['branchID']>, string>
>; // BranchSearchRequestBody.filters.branchID
export type Pin861 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<T.BranchSearchRequestBody>['filters']>['branchNumber']>, string>
>; // BranchSearchRequestBody.filters.branchNumber
export type Pin862 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<T.BranchSearchRequestBody>['filters']>['branchNo']>, number>
>; // BranchSearchRequestBody.filters.branchNo
export type Pin863 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<T.BranchSearchRequestBody>['filters']>['branchTypeID']>, string>
>; // BranchSearchRequestBody.filters.branchTypeID
export type Pin864 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<T.BranchSearchRequestBody>['filters']>['branchDescr']>, string>
>; // BranchSearchRequestBody.filters.branchDescr
export type Pin865 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<T.BranchSearchRequestBody>['filters']>['cityID']>, string>
>; // BranchSearchRequestBody.filters.cityID
export type Pin866 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<T.BranchSearchRequestBody>['filters']>['cityDescr']>, string>
>; // BranchSearchRequestBody.filters.cityDescr
export type Pin867 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<T.BranchSearchRequestBody>['filters']>['districtID']>, string>
>; // BranchSearchRequestBody.filters.districtID
export type Pin868 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<T.BranchSearchRequestBody>['filters']>['districtDescr']>, string>
>; // BranchSearchRequestBody.filters.districtDescr
export type Pin869 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<T.BranchSearchRequestBody>['filters']>['regionID']>, string>
>; // BranchSearchRequestBody.filters.regionID
export type Pin870 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<T.BranchSearchRequestBody>['filters']>['regionDescr']>, string>
>; // BranchSearchRequestBody.filters.regionDescr
export type Pin871 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<T.BranchSearchRequestBody>['filters']>['networkDepartment']>, boolean>
>; // BranchSearchRequestBody.filters.networkDepartment
export type Pin872 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<T.BranchSearchRequestBody>['filters']>['networkPartner']>, string>
>; // BranchSearchRequestBody.filters.networkPartner
export type Pin873 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<T.BranchSearchRequestBody>['filters']>['networkPartnerCode']>, string>
>; // BranchSearchRequestBody.filters.networkPartnerCode
export type Pin874 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<T.BranchSearchRequestBody>['filters']>['addressMoreInformation']>, string>
>; // BranchSearchRequestBody.filters.addressMoreInformation
export type Pin875 = Assert<Eq<NonNullable<NonNullable<T.BranchSearchRequestBody>['getCobranding']>, boolean>>; // BranchSearchRequestBody.getCobranding
export type Pin876 = Assert<Eq<NonNullable<NonNullable<T.BranchSearchRequestBody>['\u0441obrandingCode']>, string>>; // BranchSearchRequestBody.\u0441obrandingCode
export type Pin877 = Assert<
  Eq<
    keyof NonNullable<NonNullable<T.BranchSearchResult>[number]>,
    | 'branchID'
    | 'branchIDref'
    | 'branchNo'
    | 'branchCode'
    | 'branchNumber'
    | 'branchType'
    | 'isBranchOpen'
    | 'isBranchClosed'
    | 'branchTypeID'
    | 'branchTypeDescr'
    | 'branchTypeAPP'
    | 'branchTypeIDClient'
    | 'ClientTypeSubdivision'
    | 'ClientTypeSubdivisionID'
    | 'ShortName'
    | 'FullName'
    | 'cash'
    | 'networkDepartment'
    | 'networkPartner'
    | 'networkPartnerCode'
    | 'branchDescr'
    | 'ManagerReg'
    | 'PhoneManagerReg'
    | 'EMailManagerReg'
    | 'ManagerTer'
    | 'PhoneManagerTer'
    | 'EMailManagerTer'
    | 'ManagerRegDetail'
    | 'ManagerTerDetail'
    | 'addressID'
    | 'addressDescr'
    | 'addressMoreInformation'
    | 'cityID'
    | 'viewCity'
    | 'cityDescr'
    | 'districtID'
    | 'districtDescr'
    | 'regionID'
    | 'regionDescr'
    | 'workingHours'
    | 'building'
    | 'zipCode'
    | 'latitude'
    | 'longitude'
    | 'branchWorkTime'
    | 'phone'
    | 'address'
    | 'paymentTypes'
    | 'branchLimits'
    | 'Localization'
    | 'CheckoutEPS'
    | 'overloaded'
    | 'favourite'
    | 'reserve'
    | 'InboundRestriction'
    | 'InboundRestrictionStartDate'
    | 'InboundRestrictionEndDate'
    | 'ResponseArrayRecordNumber'
    | 'paymentMethods'
    | 'customerIdentification'
    | 'PartnerServices'
    | 'Services'
    | 'ScheduleLoadDepartments'
  >
>; // BranchSearchResult[] keys
export type Pin878 = Assert<Eq<Req<NonNullable<NonNullable<T.BranchSearchResult>[number]>>, never>>; // BranchSearchResult[] required
export type Pin879 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<T.BranchSearchResult>[number]>['branchID']>, string>
>; // BranchSearchResult[].branchID
export type Pin880 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<T.BranchSearchResult>[number]>['branchIDref']>, string>
>; // BranchSearchResult[].branchIDref
export type Pin881 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<T.BranchSearchResult>[number]>['branchNo']>, number>
>; // BranchSearchResult[].branchNo
export type Pin882 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<T.BranchSearchResult>[number]>['branchCode']>, string>
>; // BranchSearchResult[].branchCode
export type Pin883 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<T.BranchSearchResult>[number]>['branchNumber']>, string>
>; // BranchSearchResult[].branchNumber
export type Pin884 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<T.BranchSearchResult>[number]>['branchType']>, string>
>; // BranchSearchResult[].branchType
export type Pin885 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<T.BranchSearchResult>[number]>['isBranchOpen']>, boolean>
>; // BranchSearchResult[].isBranchOpen
export type Pin886 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<T.BranchSearchResult>[number]>['isBranchClosed']>, boolean>
>; // BranchSearchResult[].isBranchClosed
export type Pin887 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<T.BranchSearchResult>[number]>['branchTypeID']>, string>
>; // BranchSearchResult[].branchTypeID
export type Pin888 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<T.BranchSearchResult>[number]>['branchTypeDescr']>, string>
>; // BranchSearchResult[].branchTypeDescr
export type Pin889 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<T.BranchSearchResult>[number]>['branchTypeAPP']>, string>
>; // BranchSearchResult[].branchTypeAPP
export type Pin890 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<T.BranchSearchResult>[number]>['branchTypeIDClient']>, string>
>; // BranchSearchResult[].branchTypeIDClient
export type Pin891 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<T.BranchSearchResult>[number]>['ClientTypeSubdivision']>, string>
>; // BranchSearchResult[].ClientTypeSubdivision
export type Pin892 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<T.BranchSearchResult>[number]>['ClientTypeSubdivisionID']>, string>
>; // BranchSearchResult[].ClientTypeSubdivisionID
export type Pin893 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<T.BranchSearchResult>[number]>['ShortName']>, string>
>; // BranchSearchResult[].ShortName
export type Pin894 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<T.BranchSearchResult>[number]>['FullName']>, string>
>; // BranchSearchResult[].FullName
export type Pin895 = Assert<Eq<NonNullable<NonNullable<NonNullable<T.BranchSearchResult>[number]>['cash']>, boolean>>; // BranchSearchResult[].cash
export type Pin896 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<T.BranchSearchResult>[number]>['networkDepartment']>, boolean>
>; // BranchSearchResult[].networkDepartment
export type Pin897 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<T.BranchSearchResult>[number]>['networkPartner']>, string>
>; // BranchSearchResult[].networkPartner
export type Pin898 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<T.BranchSearchResult>[number]>['networkPartnerCode']>, string>
>; // BranchSearchResult[].networkPartnerCode
export type Pin899 = Assert<
  Eq<
    keyof NonNullable<NonNullable<NonNullable<T.BranchSearchResult>[number]>['branchDescr']>,
    'descrUA' | 'descrLoc' | 'descrSearchUA' | 'descrSearchLoc'
  >
>; // BranchSearchResult[].branchDescr keys
export type Pin900 = Assert<
  Eq<Req<NonNullable<NonNullable<NonNullable<T.BranchSearchResult>[number]>['branchDescr']>>, never>
>; // BranchSearchResult[].branchDescr required
export type Pin901 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<NonNullable<T.BranchSearchResult>[number]>['branchDescr']>['descrUA']>, string>
>; // BranchSearchResult[].branchDescr.descrUA
export type Pin902 = Assert<
  Eq<
    NonNullable<NonNullable<NonNullable<NonNullable<T.BranchSearchResult>[number]>['branchDescr']>['descrLoc']>,
    string
  >
>; // BranchSearchResult[].branchDescr.descrLoc
export type Pin903 = Assert<
  Eq<
    NonNullable<NonNullable<NonNullable<NonNullable<T.BranchSearchResult>[number]>['branchDescr']>['descrSearchUA']>,
    string
  >
>; // BranchSearchResult[].branchDescr.descrSearchUA
export type Pin904 = Assert<
  Eq<
    NonNullable<NonNullable<NonNullable<NonNullable<T.BranchSearchResult>[number]>['branchDescr']>['descrSearchLoc']>,
    string
  >
>; // BranchSearchResult[].branchDescr.descrSearchLoc
export type Pin905 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<T.BranchSearchResult>[number]>['ManagerReg']>, string>
>; // BranchSearchResult[].ManagerReg
export type Pin906 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<T.BranchSearchResult>[number]>['PhoneManagerReg']>, string>
>; // BranchSearchResult[].PhoneManagerReg
export type Pin907 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<T.BranchSearchResult>[number]>['EMailManagerReg']>, string>
>; // BranchSearchResult[].EMailManagerReg
export type Pin908 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<T.BranchSearchResult>[number]>['ManagerTer']>, string>
>; // BranchSearchResult[].ManagerTer
export type Pin909 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<T.BranchSearchResult>[number]>['PhoneManagerTer']>, string>
>; // BranchSearchResult[].PhoneManagerTer
export type Pin910 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<T.BranchSearchResult>[number]>['EMailManagerTer']>, string>
>; // BranchSearchResult[].EMailManagerTer
export type Pin911 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<T.BranchSearchResult>[number]>['ManagerRegDetail']>, string>
>; // BranchSearchResult[].ManagerRegDetail
export type Pin912 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<T.BranchSearchResult>[number]>['ManagerTerDetail']>, string>
>; // BranchSearchResult[].ManagerTerDetail
export type Pin913 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<T.BranchSearchResult>[number]>['addressID']>, string>
>; // BranchSearchResult[].addressID
export type Pin914 = Assert<
  Eq<
    keyof NonNullable<NonNullable<NonNullable<T.BranchSearchResult>[number]>['addressDescr']>,
    'descrUA' | 'descrRU' | 'descrEN' | 'descrLoc'
  >
>; // BranchSearchResult[].addressDescr keys
export type Pin915 = Assert<
  Eq<Req<NonNullable<NonNullable<NonNullable<T.BranchSearchResult>[number]>['addressDescr']>>, never>
>; // BranchSearchResult[].addressDescr required
export type Pin916 = Assert<
  Eq<
    NonNullable<NonNullable<NonNullable<NonNullable<T.BranchSearchResult>[number]>['addressDescr']>['descrUA']>,
    string
  >
>; // BranchSearchResult[].addressDescr.descrUA
export type Pin917 = Assert<
  Eq<
    NonNullable<NonNullable<NonNullable<NonNullable<T.BranchSearchResult>[number]>['addressDescr']>['descrRU']>,
    string
  >
>; // BranchSearchResult[].addressDescr.descrRU
export type Pin918 = Assert<
  Eq<
    NonNullable<NonNullable<NonNullable<NonNullable<T.BranchSearchResult>[number]>['addressDescr']>['descrEN']>,
    string
  >
>; // BranchSearchResult[].addressDescr.descrEN
export type Pin919 = Assert<
  Eq<
    NonNullable<NonNullable<NonNullable<NonNullable<T.BranchSearchResult>[number]>['addressDescr']>['descrLoc']>,
    string
  >
>; // BranchSearchResult[].addressDescr.descrLoc
export type Pin920 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<T.BranchSearchResult>[number]>['addressMoreInformation']>, string>
>; // BranchSearchResult[].addressMoreInformation
export type Pin921 = Assert<Eq<NonNullable<NonNullable<NonNullable<T.BranchSearchResult>[number]>['cityID']>, string>>; // BranchSearchResult[].cityID
export type Pin922 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<T.BranchSearchResult>[number]>['viewCity']>, string>
>; // BranchSearchResult[].viewCity
export type Pin923 = Assert<
  Eq<
    keyof NonNullable<NonNullable<NonNullable<T.BranchSearchResult>[number]>['cityDescr']>,
    'descrUA' | 'descrRU' | 'descrEN' | 'descrLoc'
  >
>; // BranchSearchResult[].cityDescr keys
export type Pin924 = Assert<
  Eq<Req<NonNullable<NonNullable<NonNullable<T.BranchSearchResult>[number]>['cityDescr']>>, never>
>; // BranchSearchResult[].cityDescr required
export type Pin925 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<NonNullable<T.BranchSearchResult>[number]>['cityDescr']>['descrUA']>, string>
>; // BranchSearchResult[].cityDescr.descrUA
export type Pin926 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<NonNullable<T.BranchSearchResult>[number]>['cityDescr']>['descrRU']>, string>
>; // BranchSearchResult[].cityDescr.descrRU
export type Pin927 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<NonNullable<T.BranchSearchResult>[number]>['cityDescr']>['descrEN']>, string>
>; // BranchSearchResult[].cityDescr.descrEN
export type Pin928 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<NonNullable<T.BranchSearchResult>[number]>['cityDescr']>['descrLoc']>, string>
>; // BranchSearchResult[].cityDescr.descrLoc
export type Pin929 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<T.BranchSearchResult>[number]>['districtID']>, string>
>; // BranchSearchResult[].districtID
export type Pin930 = Assert<
  Eq<
    keyof NonNullable<NonNullable<NonNullable<T.BranchSearchResult>[number]>['districtDescr']>,
    'descrUA' | 'descrRU' | 'descrEN' | 'descrLoc'
  >
>; // BranchSearchResult[].districtDescr keys
export type Pin931 = Assert<
  Eq<Req<NonNullable<NonNullable<NonNullable<T.BranchSearchResult>[number]>['districtDescr']>>, never>
>; // BranchSearchResult[].districtDescr required
export type Pin932 = Assert<
  Eq<
    NonNullable<NonNullable<NonNullable<NonNullable<T.BranchSearchResult>[number]>['districtDescr']>['descrUA']>,
    string
  >
>; // BranchSearchResult[].districtDescr.descrUA
export type Pin933 = Assert<
  Eq<
    NonNullable<NonNullable<NonNullable<NonNullable<T.BranchSearchResult>[number]>['districtDescr']>['descrRU']>,
    string
  >
>; // BranchSearchResult[].districtDescr.descrRU
export type Pin934 = Assert<
  Eq<
    NonNullable<NonNullable<NonNullable<NonNullable<T.BranchSearchResult>[number]>['districtDescr']>['descrEN']>,
    string
  >
>; // BranchSearchResult[].districtDescr.descrEN
export type Pin935 = Assert<
  Eq<
    NonNullable<NonNullable<NonNullable<NonNullable<T.BranchSearchResult>[number]>['districtDescr']>['descrLoc']>,
    string
  >
>; // BranchSearchResult[].districtDescr.descrLoc
export type Pin936 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<T.BranchSearchResult>[number]>['regionID']>, string>
>; // BranchSearchResult[].regionID
export type Pin937 = Assert<
  Eq<
    keyof NonNullable<NonNullable<NonNullable<T.BranchSearchResult>[number]>['regionDescr']>,
    'descrUA' | 'descrRU' | 'descrEN' | 'descrLoc'
  >
>; // BranchSearchResult[].regionDescr keys
export type Pin938 = Assert<
  Eq<Req<NonNullable<NonNullable<NonNullable<T.BranchSearchResult>[number]>['regionDescr']>>, never>
>; // BranchSearchResult[].regionDescr required
export type Pin939 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<NonNullable<T.BranchSearchResult>[number]>['regionDescr']>['descrUA']>, string>
>; // BranchSearchResult[].regionDescr.descrUA
export type Pin940 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<NonNullable<T.BranchSearchResult>[number]>['regionDescr']>['descrRU']>, string>
>; // BranchSearchResult[].regionDescr.descrRU
export type Pin941 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<NonNullable<T.BranchSearchResult>[number]>['regionDescr']>['descrEN']>, string>
>; // BranchSearchResult[].regionDescr.descrEN
export type Pin942 = Assert<
  Eq<
    NonNullable<NonNullable<NonNullable<NonNullable<T.BranchSearchResult>[number]>['regionDescr']>['descrLoc']>,
    string
  >
>; // BranchSearchResult[].regionDescr.descrLoc
export type Pin943 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<T.BranchSearchResult>[number]>['workingHours']>, string>
>; // BranchSearchResult[].workingHours
export type Pin944 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<T.BranchSearchResult>[number]>['building']>, string>
>; // BranchSearchResult[].building
export type Pin945 = Assert<Eq<NonNullable<NonNullable<NonNullable<T.BranchSearchResult>[number]>['zipCode']>, string>>; // BranchSearchResult[].zipCode
export type Pin946 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<T.BranchSearchResult>[number]>['latitude']>, number>
>; // BranchSearchResult[].latitude
export type Pin947 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<T.BranchSearchResult>[number]>['longitude']>, number>
>; // BranchSearchResult[].longitude
export type Pin948 = Assert<
  Eq<
    keyof NonNullable<NonNullable<NonNullable<NonNullable<T.BranchSearchResult>[number]>['branchWorkTime']>[number]>,
    'day' | 'timeFrom' | 'timeTo' | 'LunchBreakFrom' | 'LunchBreakTo'
  >
>; // BranchSearchResult[].branchWorkTime[] keys
export type Pin949 = Assert<
  Eq<
    Req<NonNullable<NonNullable<NonNullable<NonNullable<T.BranchSearchResult>[number]>['branchWorkTime']>[number]>>,
    never
  >
>; // BranchSearchResult[].branchWorkTime[] required
export type Pin950 = Assert<
  Eq<
    NonNullable<
      NonNullable<NonNullable<NonNullable<NonNullable<T.BranchSearchResult>[number]>['branchWorkTime']>[number]>['day']
    >,
    string
  >
>; // BranchSearchResult[].branchWorkTime[].day
export type Pin951 = Assert<
  Eq<
    NonNullable<
      NonNullable<
        NonNullable<NonNullable<NonNullable<T.BranchSearchResult>[number]>['branchWorkTime']>[number]
      >['timeFrom']
    >,
    string
  >
>; // BranchSearchResult[].branchWorkTime[].timeFrom
export type Pin952 = Assert<
  Eq<
    NonNullable<
      NonNullable<
        NonNullable<NonNullable<NonNullable<T.BranchSearchResult>[number]>['branchWorkTime']>[number]
      >['timeTo']
    >,
    string
  >
>; // BranchSearchResult[].branchWorkTime[].timeTo
export type Pin953 = Assert<
  Eq<
    NonNullable<
      NonNullable<
        NonNullable<NonNullable<NonNullable<T.BranchSearchResult>[number]>['branchWorkTime']>[number]
      >['LunchBreakFrom']
    >,
    string
  >
>; // BranchSearchResult[].branchWorkTime[].LunchBreakFrom
export type Pin954 = Assert<
  Eq<
    NonNullable<
      NonNullable<
        NonNullable<NonNullable<NonNullable<T.BranchSearchResult>[number]>['branchWorkTime']>[number]
      >['LunchBreakTo']
    >,
    string
  >
>; // BranchSearchResult[].branchWorkTime[].LunchBreakTo
export type Pin955 = Assert<Eq<NonNullable<NonNullable<NonNullable<T.BranchSearchResult>[number]>['phone']>, string>>; // BranchSearchResult[].phone
export type Pin956 = Assert<Eq<NonNullable<NonNullable<NonNullable<T.BranchSearchResult>[number]>['address']>, string>>; // BranchSearchResult[].address
export type Pin957 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<T.BranchSearchResult>[number]>['paymentTypes']>, string>
>; // BranchSearchResult[].paymentTypes
export type Pin958 = Assert<
  Eq<
    keyof NonNullable<NonNullable<NonNullable<T.BranchSearchResult>[number]>['branchLimits']>,
    | 'weightTotalMax'
    | 'volumeTotalMax'
    | 'insuranceTotalMax'
    | 'weightPlaceMax'
    | 'volumePlaceMax'
    | 'quantityPlacesMax'
    | 'gabaritesMax'
    | 'formatLimit'
    | 'cashPayUnavailible'
    | 'sendingOnly'
    | 'receivingOnly'
    | 'receiverCellPhoneRequired'
    | 'terminalCash'
  >
>; // BranchSearchResult[].branchLimits keys
export type Pin959 = Assert<
  Eq<Req<NonNullable<NonNullable<NonNullable<T.BranchSearchResult>[number]>['branchLimits']>>, never>
>; // BranchSearchResult[].branchLimits required
export type Pin960 = Assert<
  Eq<
    NonNullable<NonNullable<NonNullable<NonNullable<T.BranchSearchResult>[number]>['branchLimits']>['weightTotalMax']>,
    number
  >
>; // BranchSearchResult[].branchLimits.weightTotalMax
export type Pin961 = Assert<
  Eq<
    NonNullable<NonNullable<NonNullable<NonNullable<T.BranchSearchResult>[number]>['branchLimits']>['volumeTotalMax']>,
    number
  >
>; // BranchSearchResult[].branchLimits.volumeTotalMax
export type Pin962 = Assert<
  Eq<
    NonNullable<
      NonNullable<NonNullable<NonNullable<T.BranchSearchResult>[number]>['branchLimits']>['insuranceTotalMax']
    >,
    number
  >
>; // BranchSearchResult[].branchLimits.insuranceTotalMax
export type Pin963 = Assert<
  Eq<
    NonNullable<NonNullable<NonNullable<NonNullable<T.BranchSearchResult>[number]>['branchLimits']>['weightPlaceMax']>,
    number
  >
>; // BranchSearchResult[].branchLimits.weightPlaceMax
export type Pin964 = Assert<
  Eq<
    NonNullable<NonNullable<NonNullable<NonNullable<T.BranchSearchResult>[number]>['branchLimits']>['volumePlaceMax']>,
    number
  >
>; // BranchSearchResult[].branchLimits.volumePlaceMax
export type Pin965 = Assert<
  Eq<
    NonNullable<
      NonNullable<NonNullable<NonNullable<T.BranchSearchResult>[number]>['branchLimits']>['quantityPlacesMax']
    >,
    number
  >
>; // BranchSearchResult[].branchLimits.quantityPlacesMax
export type Pin966 = Assert<
  Eq<
    keyof NonNullable<
      NonNullable<NonNullable<NonNullable<T.BranchSearchResult>[number]>['branchLimits']>['gabaritesMax']
    >,
    'length' | 'width' | 'height' | 'weightMax'
  >
>; // BranchSearchResult[].branchLimits.gabaritesMax keys
export type Pin967 = Assert<
  Eq<
    Req<
      NonNullable<NonNullable<NonNullable<NonNullable<T.BranchSearchResult>[number]>['branchLimits']>['gabaritesMax']>
    >,
    never
  >
>; // BranchSearchResult[].branchLimits.gabaritesMax required
export type Pin968 = Assert<
  Eq<
    NonNullable<
      NonNullable<
        NonNullable<NonNullable<NonNullable<T.BranchSearchResult>[number]>['branchLimits']>['gabaritesMax']
      >['length']
    >,
    number
  >
>; // BranchSearchResult[].branchLimits.gabaritesMax.length
export type Pin969 = Assert<
  Eq<
    NonNullable<
      NonNullable<
        NonNullable<NonNullable<NonNullable<T.BranchSearchResult>[number]>['branchLimits']>['gabaritesMax']
      >['width']
    >,
    number
  >
>; // BranchSearchResult[].branchLimits.gabaritesMax.width
export type Pin970 = Assert<
  Eq<
    NonNullable<
      NonNullable<
        NonNullable<NonNullable<NonNullable<T.BranchSearchResult>[number]>['branchLimits']>['gabaritesMax']
      >['height']
    >,
    number
  >
>; // BranchSearchResult[].branchLimits.gabaritesMax.height
export type Pin971 = Assert<
  Eq<
    NonNullable<
      NonNullable<
        NonNullable<NonNullable<NonNullable<T.BranchSearchResult>[number]>['branchLimits']>['gabaritesMax']
      >['weightMax']
    >,
    number
  >
>; // BranchSearchResult[].branchLimits.gabaritesMax.weightMax
export type Pin972 = Assert<
  Eq<
    NonNullable<NonNullable<NonNullable<NonNullable<T.BranchSearchResult>[number]>['branchLimits']>['formatLimit']>,
    boolean
  >
>; // BranchSearchResult[].branchLimits.formatLimit
export type Pin973 = Assert<
  Eq<
    NonNullable<
      NonNullable<NonNullable<NonNullable<T.BranchSearchResult>[number]>['branchLimits']>['cashPayUnavailible']
    >,
    boolean
  >
>; // BranchSearchResult[].branchLimits.cashPayUnavailible
export type Pin974 = Assert<
  Eq<
    NonNullable<NonNullable<NonNullable<NonNullable<T.BranchSearchResult>[number]>['branchLimits']>['sendingOnly']>,
    boolean
  >
>; // BranchSearchResult[].branchLimits.sendingOnly
export type Pin975 = Assert<
  Eq<
    NonNullable<NonNullable<NonNullable<NonNullable<T.BranchSearchResult>[number]>['branchLimits']>['receivingOnly']>,
    boolean
  >
>; // BranchSearchResult[].branchLimits.receivingOnly
export type Pin976 = Assert<
  Eq<
    NonNullable<
      NonNullable<NonNullable<NonNullable<T.BranchSearchResult>[number]>['branchLimits']>['receiverCellPhoneRequired']
    >,
    boolean
  >
>; // BranchSearchResult[].branchLimits.receiverCellPhoneRequired
export type Pin977 = Assert<
  Eq<
    NonNullable<NonNullable<NonNullable<NonNullable<T.BranchSearchResult>[number]>['branchLimits']>['terminalCash']>,
    boolean
  >
>; // BranchSearchResult[].branchLimits.terminalCash
export type Pin978 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<T.BranchSearchResult>[number]>['Localization']>, string>
>; // BranchSearchResult[].Localization
export type Pin979 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<T.BranchSearchResult>[number]>['CheckoutEPS']>, boolean>
>; // BranchSearchResult[].CheckoutEPS
export type Pin980 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<T.BranchSearchResult>[number]>['overloaded']>, boolean>
>; // BranchSearchResult[].overloaded
export type Pin981 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<T.BranchSearchResult>[number]>['favourite']>, boolean>
>; // BranchSearchResult[].favourite
export type Pin982 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<T.BranchSearchResult>[number]>['reserve']>, boolean>
>; // BranchSearchResult[].reserve
export type Pin983 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<T.BranchSearchResult>[number]>['InboundRestriction']>, boolean>
>; // BranchSearchResult[].InboundRestriction
export type Pin984 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<T.BranchSearchResult>[number]>['InboundRestrictionStartDate']>, string>
>; // BranchSearchResult[].InboundRestrictionStartDate
export type Pin985 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<T.BranchSearchResult>[number]>['InboundRestrictionEndDate']>, string>
>; // BranchSearchResult[].InboundRestrictionEndDate
export type Pin986 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<T.BranchSearchResult>[number]>['ResponseArrayRecordNumber']>, number>
>; // BranchSearchResult[].ResponseArrayRecordNumber
export type Pin987 = Assert<
  Eq<
    keyof NonNullable<NonNullable<NonNullable<NonNullable<T.BranchSearchResult>[number]>['paymentMethods']>[number]>,
    'uid' | 'nameUkr'
  >
>; // BranchSearchResult[].paymentMethods[] keys
export type Pin988 = Assert<
  Eq<
    Req<NonNullable<NonNullable<NonNullable<NonNullable<T.BranchSearchResult>[number]>['paymentMethods']>[number]>>,
    never
  >
>; // BranchSearchResult[].paymentMethods[] required
export type Pin989 = Assert<
  Eq<
    NonNullable<
      NonNullable<NonNullable<NonNullable<NonNullable<T.BranchSearchResult>[number]>['paymentMethods']>[number]>['uid']
    >,
    string
  >
>; // BranchSearchResult[].paymentMethods[].uid
export type Pin990 = Assert<
  Eq<
    NonNullable<
      NonNullable<
        NonNullable<NonNullable<NonNullable<T.BranchSearchResult>[number]>['paymentMethods']>[number]
      >['nameUkr']
    >,
    string
  >
>; // BranchSearchResult[].paymentMethods[].nameUkr
export type Pin991 = Assert<
  Eq<
    keyof NonNullable<
      NonNullable<NonNullable<NonNullable<T.BranchSearchResult>[number]>['customerIdentification']>[number]
    >,
    'uid' | 'nameUkr'
  >
>; // BranchSearchResult[].customerIdentification[] keys
export type Pin992 = Assert<
  Eq<
    Req<
      NonNullable<NonNullable<NonNullable<NonNullable<T.BranchSearchResult>[number]>['customerIdentification']>[number]>
    >,
    never
  >
>; // BranchSearchResult[].customerIdentification[] required
export type Pin993 = Assert<
  Eq<
    NonNullable<
      NonNullable<
        NonNullable<NonNullable<NonNullable<T.BranchSearchResult>[number]>['customerIdentification']>[number]
      >['uid']
    >,
    string
  >
>; // BranchSearchResult[].customerIdentification[].uid
export type Pin994 = Assert<
  Eq<
    NonNullable<
      NonNullable<
        NonNullable<NonNullable<NonNullable<T.BranchSearchResult>[number]>['customerIdentification']>[number]
      >['nameUkr']
    >,
    string
  >
>; // BranchSearchResult[].customerIdentification[].nameUkr
export type Pin995 = Assert<
  Eq<
    NonNullable<NonNullable<NonNullable<NonNullable<T.BranchSearchResult>[number]>['PartnerServices']>[number]>,
    Record<string, unknown>
  >
>; // BranchSearchResult[].PartnerServices[]
export type Pin996 = Assert<
  Eq<
    keyof NonNullable<NonNullable<NonNullable<NonNullable<T.BranchSearchResult>[number]>['Services']>[number]>,
    'uid' | 'nameUkr' | '\u043aeflectMAP'
  >
>; // BranchSearchResult[].Services[] keys
export type Pin997 = Assert<
  Eq<Req<NonNullable<NonNullable<NonNullable<NonNullable<T.BranchSearchResult>[number]>['Services']>[number]>>, never>
>; // BranchSearchResult[].Services[] required
export type Pin998 = Assert<
  Eq<
    NonNullable<
      NonNullable<NonNullable<NonNullable<NonNullable<T.BranchSearchResult>[number]>['Services']>[number]>['uid']
    >,
    string
  >
>; // BranchSearchResult[].Services[].uid
export type Pin999 = Assert<
  Eq<
    NonNullable<
      NonNullable<NonNullable<NonNullable<NonNullable<T.BranchSearchResult>[number]>['Services']>[number]>['nameUkr']
    >,
    string
  >
>; // BranchSearchResult[].Services[].nameUkr
export type Pin1000 = Assert<
  Eq<
    NonNullable<
      NonNullable<
        NonNullable<NonNullable<NonNullable<T.BranchSearchResult>[number]>['Services']>[number]
      >['\u043aeflectMAP']
    >,
    boolean
  >
>; // BranchSearchResult[].Services[].\u043aeflectMAP
export type Pin1001 = Assert<
  Eq<
    keyof NonNullable<
      NonNullable<NonNullable<NonNullable<T.BranchSearchResult>[number]>['ScheduleLoadDepartments']>[number]
    >,
    | 'Time_Range'
    | 'Received_from_couriers'
    | 'Picked_up_by_couriers'
    | 'Received_by_clients'
    | 'Percentage_Received_from_couriers'
    | 'Percentage_Picked_up_by_couriers'
    | 'Percentage_Received_by_clients'
  >
>; // BranchSearchResult[].ScheduleLoadDepartments[] keys
export type Pin1002 = Assert<
  Eq<
    Req<
      NonNullable<
        NonNullable<NonNullable<NonNullable<T.BranchSearchResult>[number]>['ScheduleLoadDepartments']>[number]
      >
    >,
    never
  >
>; // BranchSearchResult[].ScheduleLoadDepartments[] required
export type Pin1003 = Assert<
  Eq<
    NonNullable<
      NonNullable<
        NonNullable<NonNullable<NonNullable<T.BranchSearchResult>[number]>['ScheduleLoadDepartments']>[number]
      >['Time_Range']
    >,
    string
  >
>; // BranchSearchResult[].ScheduleLoadDepartments[].Time_Range
export type Pin1004 = Assert<
  Eq<
    NonNullable<
      NonNullable<
        NonNullable<NonNullable<NonNullable<T.BranchSearchResult>[number]>['ScheduleLoadDepartments']>[number]
      >['Received_from_couriers']
    >,
    number
  >
>; // BranchSearchResult[].ScheduleLoadDepartments[].Received_from_couriers
export type Pin1005 = Assert<
  Eq<
    NonNullable<
      NonNullable<
        NonNullable<NonNullable<NonNullable<T.BranchSearchResult>[number]>['ScheduleLoadDepartments']>[number]
      >['Picked_up_by_couriers']
    >,
    number
  >
>; // BranchSearchResult[].ScheduleLoadDepartments[].Picked_up_by_couriers
export type Pin1006 = Assert<
  Eq<
    NonNullable<
      NonNullable<
        NonNullable<NonNullable<NonNullable<T.BranchSearchResult>[number]>['ScheduleLoadDepartments']>[number]
      >['Received_by_clients']
    >,
    number
  >
>; // BranchSearchResult[].ScheduleLoadDepartments[].Received_by_clients
export type Pin1007 = Assert<
  Eq<
    NonNullable<
      NonNullable<
        NonNullable<NonNullable<NonNullable<T.BranchSearchResult>[number]>['ScheduleLoadDepartments']>[number]
      >['Percentage_Received_from_couriers']
    >,
    number
  >
>; // BranchSearchResult[].ScheduleLoadDepartments[].Percentage_Received_from_couriers
export type Pin1008 = Assert<
  Eq<
    NonNullable<
      NonNullable<
        NonNullable<NonNullable<NonNullable<T.BranchSearchResult>[number]>['ScheduleLoadDepartments']>[number]
      >['Percentage_Picked_up_by_couriers']
    >,
    number
  >
>; // BranchSearchResult[].ScheduleLoadDepartments[].Percentage_Picked_up_by_couriers
export type Pin1009 = Assert<
  Eq<
    NonNullable<
      NonNullable<
        NonNullable<NonNullable<NonNullable<T.BranchSearchResult>[number]>['ScheduleLoadDepartments']>[number]
      >['Percentage_Received_by_clients']
    >,
    number
  >
>; // BranchSearchResult[].ScheduleLoadDepartments[].Percentage_Received_by_clients
export type Pin1010 = Assert<Eq<keyof T.BranchSearchGeoPathParams, 'latitude' | 'longitude' | 'radius'>>; // BranchSearchGeoPathParams keys
export type Pin1011 = Assert<Eq<Req<T.BranchSearchGeoPathParams>, 'latitude' | 'longitude' | 'radius'>>; // BranchSearchGeoPathParams required
export type Pin1012 = Assert<Eq<NonNullable<T.BranchSearchGeoPathParams['latitude']>, number>>; // BranchSearchGeoPathParams.latitude
export type Pin1013 = Assert<Eq<NonNullable<T.BranchSearchGeoPathParams['longitude']>, number>>; // BranchSearchGeoPathParams.longitude
export type Pin1014 = Assert<Eq<NonNullable<T.BranchSearchGeoPathParams['radius']>, number>>; // BranchSearchGeoPathParams.radius
export type Pin1015 = Assert<
  Eq<
    keyof NonNullable<NonNullable<T.BranchSearchGeoResult>[number]>,
    | 'branchID'
    | 'branchNo'
    | 'branchType'
    | 'branchTypeID'
    | 'branchTypeDes\u0441r'
    | 'branchTypeAPP'
    | 'isAvailable'
    | 'isClosed'
    | 'isDeleted'
    | 'branchDescr'
    | 'addressID'
    | 'addressDescr'
    | 'addressMoreInformation'
    | 'cityID'
    | 'cityDescr'
    | 'regionID'
    | 'regionDescr'
    | 'districtID'
    | 'districtDescr'
    | 'workingHours'
    | 'building'
    | 'zipCode'
    | 'latitude'
    | 'longitude'
    | 'favourite'
    | 'reserve'
    | 'mylatitude'
    | 'mylongitude'
    | 'distance'
    | 'radius'
    | 'branchLimits'
  >
>; // BranchSearchGeoResult[] keys
export type Pin1016 = Assert<Eq<Req<NonNullable<NonNullable<T.BranchSearchGeoResult>[number]>>, never>>; // BranchSearchGeoResult[] required
export type Pin1017 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<T.BranchSearchGeoResult>[number]>['branchID']>, string>
>; // BranchSearchGeoResult[].branchID
export type Pin1018 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<T.BranchSearchGeoResult>[number]>['branchNo']>, number>
>; // BranchSearchGeoResult[].branchNo
export type Pin1019 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<T.BranchSearchGeoResult>[number]>['branchType']>, string>
>; // BranchSearchGeoResult[].branchType
export type Pin1020 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<T.BranchSearchGeoResult>[number]>['branchTypeID']>, string>
>; // BranchSearchGeoResult[].branchTypeID
export type Pin1021 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<T.BranchSearchGeoResult>[number]>['branchTypeDes\u0441r']>, string>
>; // BranchSearchGeoResult[].branchTypeDes\u0441r
export type Pin1022 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<T.BranchSearchGeoResult>[number]>['branchTypeAPP']>, string>
>; // BranchSearchGeoResult[].branchTypeAPP
export type Pin1023 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<T.BranchSearchGeoResult>[number]>['isAvailable']>, boolean>
>; // BranchSearchGeoResult[].isAvailable
export type Pin1024 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<T.BranchSearchGeoResult>[number]>['isClosed']>, boolean>
>; // BranchSearchGeoResult[].isClosed
export type Pin1025 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<T.BranchSearchGeoResult>[number]>['isDeleted']>, boolean>
>; // BranchSearchGeoResult[].isDeleted
export type Pin1026 = Assert<
  Eq<
    keyof NonNullable<NonNullable<NonNullable<T.BranchSearchGeoResult>[number]>['branchDescr']>,
    'descrUA' | 'descrSearchUA'
  >
>; // BranchSearchGeoResult[].branchDescr keys
export type Pin1027 = Assert<
  Eq<Req<NonNullable<NonNullable<NonNullable<T.BranchSearchGeoResult>[number]>['branchDescr']>>, never>
>; // BranchSearchGeoResult[].branchDescr required
export type Pin1028 = Assert<
  Eq<
    NonNullable<NonNullable<NonNullable<NonNullable<T.BranchSearchGeoResult>[number]>['branchDescr']>['descrUA']>,
    string
  >
>; // BranchSearchGeoResult[].branchDescr.descrUA
export type Pin1029 = Assert<
  Eq<
    NonNullable<NonNullable<NonNullable<NonNullable<T.BranchSearchGeoResult>[number]>['branchDescr']>['descrSearchUA']>,
    string
  >
>; // BranchSearchGeoResult[].branchDescr.descrSearchUA
export type Pin1030 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<T.BranchSearchGeoResult>[number]>['addressID']>, string>
>; // BranchSearchGeoResult[].addressID
export type Pin1031 = Assert<
  Eq<
    keyof NonNullable<NonNullable<NonNullable<T.BranchSearchGeoResult>[number]>['addressDescr']>,
    'descrUA' | 'descrRU' | 'descrEN'
  >
>; // BranchSearchGeoResult[].addressDescr keys
export type Pin1032 = Assert<
  Eq<Req<NonNullable<NonNullable<NonNullable<T.BranchSearchGeoResult>[number]>['addressDescr']>>, never>
>; // BranchSearchGeoResult[].addressDescr required
export type Pin1033 = Assert<
  Eq<
    NonNullable<NonNullable<NonNullable<NonNullable<T.BranchSearchGeoResult>[number]>['addressDescr']>['descrUA']>,
    string
  >
>; // BranchSearchGeoResult[].addressDescr.descrUA
export type Pin1034 = Assert<
  Eq<
    NonNullable<NonNullable<NonNullable<NonNullable<T.BranchSearchGeoResult>[number]>['addressDescr']>['descrRU']>,
    string
  >
>; // BranchSearchGeoResult[].addressDescr.descrRU
export type Pin1035 = Assert<
  Eq<
    NonNullable<NonNullable<NonNullable<NonNullable<T.BranchSearchGeoResult>[number]>['addressDescr']>['descrEN']>,
    string
  >
>; // BranchSearchGeoResult[].addressDescr.descrEN
export type Pin1036 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<T.BranchSearchGeoResult>[number]>['addressMoreInformation']>, string>
>; // BranchSearchGeoResult[].addressMoreInformation
export type Pin1037 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<T.BranchSearchGeoResult>[number]>['cityID']>, string>
>; // BranchSearchGeoResult[].cityID
export type Pin1038 = Assert<
  Eq<
    keyof NonNullable<NonNullable<NonNullable<T.BranchSearchGeoResult>[number]>['cityDescr']>,
    'descrUA' | 'descrRU' | 'descrEN'
  >
>; // BranchSearchGeoResult[].cityDescr keys
export type Pin1039 = Assert<
  Eq<Req<NonNullable<NonNullable<NonNullable<T.BranchSearchGeoResult>[number]>['cityDescr']>>, never>
>; // BranchSearchGeoResult[].cityDescr required
export type Pin1040 = Assert<
  Eq<
    NonNullable<NonNullable<NonNullable<NonNullable<T.BranchSearchGeoResult>[number]>['cityDescr']>['descrUA']>,
    string
  >
>; // BranchSearchGeoResult[].cityDescr.descrUA
export type Pin1041 = Assert<
  Eq<
    NonNullable<NonNullable<NonNullable<NonNullable<T.BranchSearchGeoResult>[number]>['cityDescr']>['descrRU']>,
    string
  >
>; // BranchSearchGeoResult[].cityDescr.descrRU
export type Pin1042 = Assert<
  Eq<
    NonNullable<NonNullable<NonNullable<NonNullable<T.BranchSearchGeoResult>[number]>['cityDescr']>['descrEN']>,
    string
  >
>; // BranchSearchGeoResult[].cityDescr.descrEN
export type Pin1043 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<T.BranchSearchGeoResult>[number]>['regionID']>, string>
>; // BranchSearchGeoResult[].regionID
export type Pin1044 = Assert<
  Eq<
    keyof NonNullable<NonNullable<NonNullable<T.BranchSearchGeoResult>[number]>['regionDescr']>,
    'descrUA' | 'descrRU' | 'descrEN'
  >
>; // BranchSearchGeoResult[].regionDescr keys
export type Pin1045 = Assert<
  Eq<Req<NonNullable<NonNullable<NonNullable<T.BranchSearchGeoResult>[number]>['regionDescr']>>, never>
>; // BranchSearchGeoResult[].regionDescr required
export type Pin1046 = Assert<
  Eq<
    NonNullable<NonNullable<NonNullable<NonNullable<T.BranchSearchGeoResult>[number]>['regionDescr']>['descrUA']>,
    string
  >
>; // BranchSearchGeoResult[].regionDescr.descrUA
export type Pin1047 = Assert<
  Eq<
    NonNullable<NonNullable<NonNullable<NonNullable<T.BranchSearchGeoResult>[number]>['regionDescr']>['descrRU']>,
    string
  >
>; // BranchSearchGeoResult[].regionDescr.descrRU
export type Pin1048 = Assert<
  Eq<
    NonNullable<NonNullable<NonNullable<NonNullable<T.BranchSearchGeoResult>[number]>['regionDescr']>['descrEN']>,
    string
  >
>; // BranchSearchGeoResult[].regionDescr.descrEN
export type Pin1049 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<T.BranchSearchGeoResult>[number]>['districtID']>, string>
>; // BranchSearchGeoResult[].districtID
export type Pin1050 = Assert<
  Eq<
    keyof NonNullable<NonNullable<NonNullable<T.BranchSearchGeoResult>[number]>['districtDescr']>,
    'descrUA' | 'descrRU' | 'descrEN'
  >
>; // BranchSearchGeoResult[].districtDescr keys
export type Pin1051 = Assert<
  Eq<Req<NonNullable<NonNullable<NonNullable<T.BranchSearchGeoResult>[number]>['districtDescr']>>, never>
>; // BranchSearchGeoResult[].districtDescr required
export type Pin1052 = Assert<
  Eq<
    NonNullable<NonNullable<NonNullable<NonNullable<T.BranchSearchGeoResult>[number]>['districtDescr']>['descrUA']>,
    string
  >
>; // BranchSearchGeoResult[].districtDescr.descrUA
export type Pin1053 = Assert<
  Eq<
    NonNullable<NonNullable<NonNullable<NonNullable<T.BranchSearchGeoResult>[number]>['districtDescr']>['descrRU']>,
    string
  >
>; // BranchSearchGeoResult[].districtDescr.descrRU
export type Pin1054 = Assert<
  Eq<
    NonNullable<NonNullable<NonNullable<NonNullable<T.BranchSearchGeoResult>[number]>['districtDescr']>['descrEN']>,
    string
  >
>; // BranchSearchGeoResult[].districtDescr.descrEN
export type Pin1055 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<T.BranchSearchGeoResult>[number]>['workingHours']>, string>
>; // BranchSearchGeoResult[].workingHours
export type Pin1056 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<T.BranchSearchGeoResult>[number]>['building']>, string>
>; // BranchSearchGeoResult[].building
export type Pin1057 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<T.BranchSearchGeoResult>[number]>['zipCode']>, string>
>; // BranchSearchGeoResult[].zipCode
export type Pin1058 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<T.BranchSearchGeoResult>[number]>['latitude']>, number>
>; // BranchSearchGeoResult[].latitude
export type Pin1059 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<T.BranchSearchGeoResult>[number]>['longitude']>, number>
>; // BranchSearchGeoResult[].longitude
export type Pin1060 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<T.BranchSearchGeoResult>[number]>['favourite']>, boolean>
>; // BranchSearchGeoResult[].favourite
export type Pin1061 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<T.BranchSearchGeoResult>[number]>['reserve']>, boolean>
>; // BranchSearchGeoResult[].reserve
export type Pin1062 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<T.BranchSearchGeoResult>[number]>['mylatitude']>, number>
>; // BranchSearchGeoResult[].mylatitude
export type Pin1063 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<T.BranchSearchGeoResult>[number]>['mylongitude']>, number>
>; // BranchSearchGeoResult[].mylongitude
export type Pin1064 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<T.BranchSearchGeoResult>[number]>['distance']>, number>
>; // BranchSearchGeoResult[].distance
export type Pin1065 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<T.BranchSearchGeoResult>[number]>['radius']>, number>
>; // BranchSearchGeoResult[].radius
export type Pin1066 = Assert<
  Eq<
    keyof NonNullable<NonNullable<NonNullable<T.BranchSearchGeoResult>[number]>['branchLimits']>,
    | 'weightTotalMax'
    | 'volumeTotalMax'
    | 'insuranceTotalMax'
    | 'weightPlaceMax'
    | 'quantityPlacesMax'
    | 'storageDays'
    | 'gabaritesMax'
    | 'formatLimit'
    | 'cashPayUnavailible'
    | 'sendingOnly'
    | 'receivingOnly'
    | 'receiverCellPhoneRequired'
    | 'terminalCash'
  >
>; // BranchSearchGeoResult[].branchLimits keys
export type Pin1067 = Assert<
  Eq<Req<NonNullable<NonNullable<NonNullable<T.BranchSearchGeoResult>[number]>['branchLimits']>>, never>
>; // BranchSearchGeoResult[].branchLimits required
export type Pin1068 = Assert<
  Eq<
    NonNullable<
      NonNullable<NonNullable<NonNullable<T.BranchSearchGeoResult>[number]>['branchLimits']>['weightTotalMax']
    >,
    number
  >
>; // BranchSearchGeoResult[].branchLimits.weightTotalMax
export type Pin1069 = Assert<
  Eq<
    NonNullable<
      NonNullable<NonNullable<NonNullable<T.BranchSearchGeoResult>[number]>['branchLimits']>['volumeTotalMax']
    >,
    number
  >
>; // BranchSearchGeoResult[].branchLimits.volumeTotalMax
export type Pin1070 = Assert<
  Eq<
    NonNullable<
      NonNullable<NonNullable<NonNullable<T.BranchSearchGeoResult>[number]>['branchLimits']>['insuranceTotalMax']
    >,
    number
  >
>; // BranchSearchGeoResult[].branchLimits.insuranceTotalMax
export type Pin1071 = Assert<
  Eq<
    NonNullable<
      NonNullable<NonNullable<NonNullable<T.BranchSearchGeoResult>[number]>['branchLimits']>['weightPlaceMax']
    >,
    number
  >
>; // BranchSearchGeoResult[].branchLimits.weightPlaceMax
export type Pin1072 = Assert<
  Eq<
    NonNullable<
      NonNullable<NonNullable<NonNullable<T.BranchSearchGeoResult>[number]>['branchLimits']>['quantityPlacesMax']
    >,
    number
  >
>; // BranchSearchGeoResult[].branchLimits.quantityPlacesMax
export type Pin1073 = Assert<
  Eq<
    NonNullable<NonNullable<NonNullable<NonNullable<T.BranchSearchGeoResult>[number]>['branchLimits']>['storageDays']>,
    number
  >
>; // BranchSearchGeoResult[].branchLimits.storageDays
export type Pin1074 = Assert<
  Eq<
    keyof NonNullable<
      NonNullable<NonNullable<NonNullable<T.BranchSearchGeoResult>[number]>['branchLimits']>['gabaritesMax']
    >,
    'length' | 'width' | 'height'
  >
>; // BranchSearchGeoResult[].branchLimits.gabaritesMax keys
export type Pin1075 = Assert<
  Eq<
    Req<
      NonNullable<
        NonNullable<NonNullable<NonNullable<T.BranchSearchGeoResult>[number]>['branchLimits']>['gabaritesMax']
      >
    >,
    never
  >
>; // BranchSearchGeoResult[].branchLimits.gabaritesMax required
export type Pin1076 = Assert<
  Eq<
    NonNullable<
      NonNullable<
        NonNullable<NonNullable<NonNullable<T.BranchSearchGeoResult>[number]>['branchLimits']>['gabaritesMax']
      >['length']
    >,
    number
  >
>; // BranchSearchGeoResult[].branchLimits.gabaritesMax.length
export type Pin1077 = Assert<
  Eq<
    NonNullable<
      NonNullable<
        NonNullable<NonNullable<NonNullable<T.BranchSearchGeoResult>[number]>['branchLimits']>['gabaritesMax']
      >['width']
    >,
    number
  >
>; // BranchSearchGeoResult[].branchLimits.gabaritesMax.width
export type Pin1078 = Assert<
  Eq<
    NonNullable<
      NonNullable<
        NonNullable<NonNullable<NonNullable<T.BranchSearchGeoResult>[number]>['branchLimits']>['gabaritesMax']
      >['height']
    >,
    number
  >
>; // BranchSearchGeoResult[].branchLimits.gabaritesMax.height
export type Pin1079 = Assert<
  Eq<
    NonNullable<NonNullable<NonNullable<NonNullable<T.BranchSearchGeoResult>[number]>['branchLimits']>['formatLimit']>,
    boolean
  >
>; // BranchSearchGeoResult[].branchLimits.formatLimit
export type Pin1080 = Assert<
  Eq<
    NonNullable<
      NonNullable<NonNullable<NonNullable<T.BranchSearchGeoResult>[number]>['branchLimits']>['cashPayUnavailible']
    >,
    boolean
  >
>; // BranchSearchGeoResult[].branchLimits.cashPayUnavailible
export type Pin1081 = Assert<
  Eq<
    NonNullable<NonNullable<NonNullable<NonNullable<T.BranchSearchGeoResult>[number]>['branchLimits']>['sendingOnly']>,
    boolean
  >
>; // BranchSearchGeoResult[].branchLimits.sendingOnly
export type Pin1082 = Assert<
  Eq<
    NonNullable<
      NonNullable<NonNullable<NonNullable<T.BranchSearchGeoResult>[number]>['branchLimits']>['receivingOnly']
    >,
    boolean
  >
>; // BranchSearchGeoResult[].branchLimits.receivingOnly
export type Pin1083 = Assert<
  Eq<
    NonNullable<
      NonNullable<
        NonNullable<NonNullable<T.BranchSearchGeoResult>[number]>['branchLimits']
      >['receiverCellPhoneRequired']
    >,
    boolean
  >
>; // BranchSearchGeoResult[].branchLimits.receiverCellPhoneRequired
export type Pin1084 = Assert<
  Eq<
    NonNullable<NonNullable<NonNullable<NonNullable<T.BranchSearchGeoResult>[number]>['branchLimits']>['terminalCash']>,
    boolean
  >
>; // BranchSearchGeoResult[].branchLimits.terminalCash
export type Pin1085 = Assert<
  Eq<
    keyof NonNullable<NonNullable<T.BranchTypesResult>[number]>,
    | 'branchTypeID'
    | 'branchTypeDescr'
    | 'branchLimits'
    | 'ClientTypeSubdivisionID'
    | 'ClientTypeSubdivision'
    | 'ClientTypeDepartmentNameMini'
    | 'ClientTypeDepartmentDescription'
  >
>; // BranchTypesResult[] keys
export type Pin1086 = Assert<Eq<Req<NonNullable<NonNullable<T.BranchTypesResult>[number]>>, never>>; // BranchTypesResult[] required
export type Pin1087 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<T.BranchTypesResult>[number]>['branchTypeID']>, string>
>; // BranchTypesResult[].branchTypeID
export type Pin1088 = Assert<
  Eq<
    keyof NonNullable<NonNullable<NonNullable<T.BranchTypesResult>[number]>['branchTypeDescr']>,
    'descrUA' | 'type' | 'typeAPP'
  >
>; // BranchTypesResult[].branchTypeDescr keys
export type Pin1089 = Assert<
  Eq<Req<NonNullable<NonNullable<NonNullable<T.BranchTypesResult>[number]>['branchTypeDescr']>>, never>
>; // BranchTypesResult[].branchTypeDescr required
export type Pin1090 = Assert<
  Eq<
    NonNullable<NonNullable<NonNullable<NonNullable<T.BranchTypesResult>[number]>['branchTypeDescr']>['descrUA']>,
    string
  >
>; // BranchTypesResult[].branchTypeDescr.descrUA
export type Pin1091 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<NonNullable<T.BranchTypesResult>[number]>['branchTypeDescr']>['type']>, string>
>; // BranchTypesResult[].branchTypeDescr.type
export type Pin1092 = Assert<
  Eq<
    NonNullable<NonNullable<NonNullable<NonNullable<T.BranchTypesResult>[number]>['branchTypeDescr']>['typeAPP']>,
    string
  >
>; // BranchTypesResult[].branchTypeDescr.typeAPP
export type Pin1093 = Assert<
  Eq<
    keyof NonNullable<NonNullable<NonNullable<T.BranchTypesResult>[number]>['branchLimits']>,
    | 'weightTotalMax'
    | 'weightPlaceMax'
    | 'volumeTotalMax'
    | 'quantityPlacesMax'
    | 'insuranceTotalMax'
    | 'storageDays'
    | 'gabaritesMax'
  >
>; // BranchTypesResult[].branchLimits keys
export type Pin1094 = Assert<
  Eq<Req<NonNullable<NonNullable<NonNullable<T.BranchTypesResult>[number]>['branchLimits']>>, never>
>; // BranchTypesResult[].branchLimits required
export type Pin1095 = Assert<
  Eq<
    NonNullable<NonNullable<NonNullable<NonNullable<T.BranchTypesResult>[number]>['branchLimits']>['weightTotalMax']>,
    number
  >
>; // BranchTypesResult[].branchLimits.weightTotalMax
export type Pin1096 = Assert<
  Eq<
    NonNullable<NonNullable<NonNullable<NonNullable<T.BranchTypesResult>[number]>['branchLimits']>['weightPlaceMax']>,
    number
  >
>; // BranchTypesResult[].branchLimits.weightPlaceMax
export type Pin1097 = Assert<
  Eq<
    NonNullable<NonNullable<NonNullable<NonNullable<T.BranchTypesResult>[number]>['branchLimits']>['volumeTotalMax']>,
    number
  >
>; // BranchTypesResult[].branchLimits.volumeTotalMax
export type Pin1098 = Assert<
  Eq<
    NonNullable<
      NonNullable<NonNullable<NonNullable<T.BranchTypesResult>[number]>['branchLimits']>['quantityPlacesMax']
    >,
    number
  >
>; // BranchTypesResult[].branchLimits.quantityPlacesMax
export type Pin1099 = Assert<
  Eq<
    NonNullable<
      NonNullable<NonNullable<NonNullable<T.BranchTypesResult>[number]>['branchLimits']>['insuranceTotalMax']
    >,
    number
  >
>; // BranchTypesResult[].branchLimits.insuranceTotalMax
export type Pin1100 = Assert<
  Eq<
    NonNullable<NonNullable<NonNullable<NonNullable<T.BranchTypesResult>[number]>['branchLimits']>['storageDays']>,
    number
  >
>; // BranchTypesResult[].branchLimits.storageDays
export type Pin1101 = Assert<
  Eq<
    keyof NonNullable<
      NonNullable<NonNullable<NonNullable<T.BranchTypesResult>[number]>['branchLimits']>['gabaritesMax']
    >,
    'length' | 'width' | 'height'
  >
>; // BranchTypesResult[].branchLimits.gabaritesMax keys
export type Pin1102 = Assert<
  Eq<
    Req<
      NonNullable<NonNullable<NonNullable<NonNullable<T.BranchTypesResult>[number]>['branchLimits']>['gabaritesMax']>
    >,
    never
  >
>; // BranchTypesResult[].branchLimits.gabaritesMax required
export type Pin1103 = Assert<
  Eq<
    NonNullable<
      NonNullable<
        NonNullable<NonNullable<NonNullable<T.BranchTypesResult>[number]>['branchLimits']>['gabaritesMax']
      >['length']
    >,
    number
  >
>; // BranchTypesResult[].branchLimits.gabaritesMax.length
export type Pin1104 = Assert<
  Eq<
    NonNullable<
      NonNullable<
        NonNullable<NonNullable<NonNullable<T.BranchTypesResult>[number]>['branchLimits']>['gabaritesMax']
      >['width']
    >,
    number
  >
>; // BranchTypesResult[].branchLimits.gabaritesMax.width
export type Pin1105 = Assert<
  Eq<
    NonNullable<
      NonNullable<
        NonNullable<NonNullable<NonNullable<T.BranchTypesResult>[number]>['branchLimits']>['gabaritesMax']
      >['height']
    >,
    number
  >
>; // BranchTypesResult[].branchLimits.gabaritesMax.height
export type Pin1106 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<T.BranchTypesResult>[number]>['ClientTypeSubdivisionID']>, string>
>; // BranchTypesResult[].ClientTypeSubdivisionID
export type Pin1107 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<T.BranchTypesResult>[number]>['ClientTypeSubdivision']>, string>
>; // BranchTypesResult[].ClientTypeSubdivision
export type Pin1108 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<T.BranchTypesResult>[number]>['ClientTypeDepartmentNameMini']>, string>
>; // BranchTypesResult[].ClientTypeDepartmentNameMini
export type Pin1109 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<T.BranchTypesResult>[number]>['ClientTypeDepartmentDescription']>, string>
>; // BranchTypesResult[].ClientTypeDepartmentDescription
export type Pin1110 = Assert<Eq<keyof NonNullable<T.CitySearchRequestBody>, 'filters' | 'isDirectory'>>; // CitySearchRequestBody keys
export type Pin1111 = Assert<Eq<Req<NonNullable<T.CitySearchRequestBody>>, never>>; // CitySearchRequestBody required
export type Pin1112 = Assert<
  Eq<
    keyof NonNullable<NonNullable<T.CitySearchRequestBody>['filters']>,
    | 'cityID'
    | 'cityKATUU'
    | 'cityDescr'
    | 'districtID'
    | 'districtDescr'
    | 'countryID'
    | 'regionID'
    | 'regionDescr'
    | 'isDeliveryInCity'
    | 'IsBranchInCity'
  >
>; // CitySearchRequestBody.filters keys
export type Pin1113 = Assert<Eq<Req<NonNullable<NonNullable<T.CitySearchRequestBody>['filters']>>, never>>; // CitySearchRequestBody.filters required
export type Pin1114 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<T.CitySearchRequestBody>['filters']>['cityID']>, string>
>; // CitySearchRequestBody.filters.cityID
export type Pin1115 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<T.CitySearchRequestBody>['filters']>['cityKATUU']>, string>
>; // CitySearchRequestBody.filters.cityKATUU
export type Pin1116 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<T.CitySearchRequestBody>['filters']>['cityDescr']>, string>
>; // CitySearchRequestBody.filters.cityDescr
export type Pin1117 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<T.CitySearchRequestBody>['filters']>['districtID']>, string>
>; // CitySearchRequestBody.filters.districtID
export type Pin1118 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<T.CitySearchRequestBody>['filters']>['districtDescr']>, string>
>; // CitySearchRequestBody.filters.districtDescr
export type Pin1119 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<T.CitySearchRequestBody>['filters']>['countryID']>, string>
>; // CitySearchRequestBody.filters.countryID
export type Pin1120 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<T.CitySearchRequestBody>['filters']>['regionID']>, string>
>; // CitySearchRequestBody.filters.regionID
export type Pin1121 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<T.CitySearchRequestBody>['filters']>['regionDescr']>, string>
>; // CitySearchRequestBody.filters.regionDescr
export type Pin1122 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<T.CitySearchRequestBody>['filters']>['isDeliveryInCity']>, boolean>
>; // CitySearchRequestBody.filters.isDeliveryInCity
export type Pin1123 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<T.CitySearchRequestBody>['filters']>['IsBranchInCity']>, boolean>
>; // CitySearchRequestBody.filters.IsBranchInCity
export type Pin1124 = Assert<Eq<NonNullable<NonNullable<T.CitySearchRequestBody>['isDirectory']>, boolean>>; // CitySearchRequestBody.isDirectory
export type Pin1125 = Assert<
  Eq<
    keyof NonNullable<NonNullable<T.CitySearchResult>[number]>,
    | 'cityID'
    | 'viewCity'
    | 'cityKATUU'
    | 'cityDescr'
    | 'districtID'
    | 'districtDescr'
    | 'regionID'
    | 'regionDescr'
    | 'countryID'
    | 'isBranchInCity'
    | 'isDeliveryInCity'
    | 'deliveryZone'
    | 'deliveryDays'
    | 'latitude'
    | 'longitude'
    | 'Localization'
    | 'isAvailableDoorService'
    | 'cityLimitsDoorService'
  >
>; // CitySearchResult[] keys
export type Pin1126 = Assert<Eq<Req<NonNullable<NonNullable<T.CitySearchResult>[number]>>, never>>; // CitySearchResult[] required
export type Pin1127 = Assert<Eq<NonNullable<NonNullable<NonNullable<T.CitySearchResult>[number]>['cityID']>, string>>; // CitySearchResult[].cityID
export type Pin1128 = Assert<Eq<NonNullable<NonNullable<NonNullable<T.CitySearchResult>[number]>['viewCity']>, string>>; // CitySearchResult[].viewCity
export type Pin1129 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<T.CitySearchResult>[number]>['cityKATUU']>, string>
>; // CitySearchResult[].cityKATUU
export type Pin1130 = Assert<
  Eq<
    keyof NonNullable<NonNullable<NonNullable<T.CitySearchResult>[number]>['cityDescr']>,
    'descrUA' | 'descrRU' | 'descrEN'
  >
>; // CitySearchResult[].cityDescr keys
export type Pin1131 = Assert<
  Eq<Req<NonNullable<NonNullable<NonNullable<T.CitySearchResult>[number]>['cityDescr']>>, never>
>; // CitySearchResult[].cityDescr required
export type Pin1132 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<NonNullable<T.CitySearchResult>[number]>['cityDescr']>['descrUA']>, string>
>; // CitySearchResult[].cityDescr.descrUA
export type Pin1133 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<NonNullable<T.CitySearchResult>[number]>['cityDescr']>['descrRU']>, string>
>; // CitySearchResult[].cityDescr.descrRU
export type Pin1134 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<NonNullable<T.CitySearchResult>[number]>['cityDescr']>['descrEN']>, string>
>; // CitySearchResult[].cityDescr.descrEN
export type Pin1135 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<T.CitySearchResult>[number]>['districtID']>, string>
>; // CitySearchResult[].districtID
export type Pin1136 = Assert<
  Eq<
    keyof NonNullable<NonNullable<NonNullable<T.CitySearchResult>[number]>['districtDescr']>,
    'descrUA' | 'descrRU' | 'descrEN'
  >
>; // CitySearchResult[].districtDescr keys
export type Pin1137 = Assert<
  Eq<Req<NonNullable<NonNullable<NonNullable<T.CitySearchResult>[number]>['districtDescr']>>, never>
>; // CitySearchResult[].districtDescr required
export type Pin1138 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<NonNullable<T.CitySearchResult>[number]>['districtDescr']>['descrUA']>, string>
>; // CitySearchResult[].districtDescr.descrUA
export type Pin1139 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<NonNullable<T.CitySearchResult>[number]>['districtDescr']>['descrRU']>, string>
>; // CitySearchResult[].districtDescr.descrRU
export type Pin1140 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<NonNullable<T.CitySearchResult>[number]>['districtDescr']>['descrEN']>, string>
>; // CitySearchResult[].districtDescr.descrEN
export type Pin1141 = Assert<Eq<NonNullable<NonNullable<NonNullable<T.CitySearchResult>[number]>['regionID']>, string>>; // CitySearchResult[].regionID
export type Pin1142 = Assert<
  Eq<
    keyof NonNullable<NonNullable<NonNullable<T.CitySearchResult>[number]>['regionDescr']>,
    'descrUA' | 'descrRU' | 'descrEN'
  >
>; // CitySearchResult[].regionDescr keys
export type Pin1143 = Assert<
  Eq<Req<NonNullable<NonNullable<NonNullable<T.CitySearchResult>[number]>['regionDescr']>>, never>
>; // CitySearchResult[].regionDescr required
export type Pin1144 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<NonNullable<T.CitySearchResult>[number]>['regionDescr']>['descrUA']>, string>
>; // CitySearchResult[].regionDescr.descrUA
export type Pin1145 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<NonNullable<T.CitySearchResult>[number]>['regionDescr']>['descrRU']>, string>
>; // CitySearchResult[].regionDescr.descrRU
export type Pin1146 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<NonNullable<T.CitySearchResult>[number]>['regionDescr']>['descrEN']>, string>
>; // CitySearchResult[].regionDescr.descrEN
export type Pin1147 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<T.CitySearchResult>[number]>['countryID']>, string>
>; // CitySearchResult[].countryID
export type Pin1148 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<T.CitySearchResult>[number]>['isBranchInCity']>, boolean>
>; // CitySearchResult[].isBranchInCity
export type Pin1149 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<T.CitySearchResult>[number]>['isDeliveryInCity']>, boolean>
>; // CitySearchResult[].isDeliveryInCity
export type Pin1150 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<T.CitySearchResult>[number]>['deliveryZone']>, number>
>; // CitySearchResult[].deliveryZone
export type Pin1151 = Assert<
  Eq<
    keyof NonNullable<NonNullable<NonNullable<T.CitySearchResult>[number]>['deliveryDays']>,
    'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun'
  >
>; // CitySearchResult[].deliveryDays keys
export type Pin1152 = Assert<
  Eq<Req<NonNullable<NonNullable<NonNullable<T.CitySearchResult>[number]>['deliveryDays']>>, never>
>; // CitySearchResult[].deliveryDays required
export type Pin1153 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<NonNullable<T.CitySearchResult>[number]>['deliveryDays']>['Mon']>, boolean>
>; // CitySearchResult[].deliveryDays.Mon
export type Pin1154 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<NonNullable<T.CitySearchResult>[number]>['deliveryDays']>['Tue']>, boolean>
>; // CitySearchResult[].deliveryDays.Tue
export type Pin1155 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<NonNullable<T.CitySearchResult>[number]>['deliveryDays']>['Wed']>, boolean>
>; // CitySearchResult[].deliveryDays.Wed
export type Pin1156 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<NonNullable<T.CitySearchResult>[number]>['deliveryDays']>['Thu']>, boolean>
>; // CitySearchResult[].deliveryDays.Thu
export type Pin1157 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<NonNullable<T.CitySearchResult>[number]>['deliveryDays']>['Fri']>, boolean>
>; // CitySearchResult[].deliveryDays.Fri
export type Pin1158 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<NonNullable<T.CitySearchResult>[number]>['deliveryDays']>['Sat']>, boolean>
>; // CitySearchResult[].deliveryDays.Sat
export type Pin1159 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<NonNullable<T.CitySearchResult>[number]>['deliveryDays']>['Sun']>, boolean>
>; // CitySearchResult[].deliveryDays.Sun
export type Pin1160 = Assert<Eq<NonNullable<NonNullable<NonNullable<T.CitySearchResult>[number]>['latitude']>, string>>; // CitySearchResult[].latitude
export type Pin1161 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<T.CitySearchResult>[number]>['longitude']>, string>
>; // CitySearchResult[].longitude
export type Pin1162 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<T.CitySearchResult>[number]>['Localization']>, string>
>; // CitySearchResult[].Localization
export type Pin1163 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<T.CitySearchResult>[number]>['isAvailableDoorService']>, boolean>
>; // CitySearchResult[].isAvailableDoorService
export type Pin1164 = Assert<
  Eq<
    keyof NonNullable<NonNullable<NonNullable<T.CitySearchResult>[number]>['cityLimitsDoorService']>,
    | 'disabledDoorService'
    | 'weightPlaceMax'
    | 'weightTotalMax'
    | 'volumeTotalMax'
    | 'insuranceTotalMax'
    | 'quantityPlacesMax'
    | 'gabaritesMaxlength'
    | 'gabaritesMaxwidth'
    | 'gabaritesMaxheight'
  >
>; // CitySearchResult[].cityLimitsDoorService keys
export type Pin1165 = Assert<
  Eq<Req<NonNullable<NonNullable<NonNullable<T.CitySearchResult>[number]>['cityLimitsDoorService']>>, never>
>; // CitySearchResult[].cityLimitsDoorService required
export type Pin1166 = Assert<
  Eq<
    NonNullable<
      NonNullable<NonNullable<NonNullable<T.CitySearchResult>[number]>['cityLimitsDoorService']>['disabledDoorService']
    >,
    boolean
  >
>; // CitySearchResult[].cityLimitsDoorService.disabledDoorService
export type Pin1167 = Assert<
  Eq<
    NonNullable<
      NonNullable<NonNullable<NonNullable<T.CitySearchResult>[number]>['cityLimitsDoorService']>['weightPlaceMax']
    >,
    number
  >
>; // CitySearchResult[].cityLimitsDoorService.weightPlaceMax
export type Pin1168 = Assert<
  Eq<
    NonNullable<
      NonNullable<NonNullable<NonNullable<T.CitySearchResult>[number]>['cityLimitsDoorService']>['weightTotalMax']
    >,
    number
  >
>; // CitySearchResult[].cityLimitsDoorService.weightTotalMax
export type Pin1169 = Assert<
  Eq<
    NonNullable<
      NonNullable<NonNullable<NonNullable<T.CitySearchResult>[number]>['cityLimitsDoorService']>['volumeTotalMax']
    >,
    number
  >
>; // CitySearchResult[].cityLimitsDoorService.volumeTotalMax
export type Pin1170 = Assert<
  Eq<
    NonNullable<
      NonNullable<NonNullable<NonNullable<T.CitySearchResult>[number]>['cityLimitsDoorService']>['insuranceTotalMax']
    >,
    number
  >
>; // CitySearchResult[].cityLimitsDoorService.insuranceTotalMax
export type Pin1171 = Assert<
  Eq<
    NonNullable<
      NonNullable<NonNullable<NonNullable<T.CitySearchResult>[number]>['cityLimitsDoorService']>['quantityPlacesMax']
    >,
    number
  >
>; // CitySearchResult[].cityLimitsDoorService.quantityPlacesMax
export type Pin1172 = Assert<
  Eq<
    NonNullable<
      NonNullable<NonNullable<NonNullable<T.CitySearchResult>[number]>['cityLimitsDoorService']>['gabaritesMaxlength']
    >,
    number
  >
>; // CitySearchResult[].cityLimitsDoorService.gabaritesMaxlength
export type Pin1173 = Assert<
  Eq<
    NonNullable<
      NonNullable<NonNullable<NonNullable<T.CitySearchResult>[number]>['cityLimitsDoorService']>['gabaritesMaxwidth']
    >,
    number
  >
>; // CitySearchResult[].cityLimitsDoorService.gabaritesMaxwidth
export type Pin1174 = Assert<
  Eq<
    NonNullable<
      NonNullable<NonNullable<NonNullable<T.CitySearchResult>[number]>['cityLimitsDoorService']>['gabaritesMaxheight']
    >,
    number
  >
>; // CitySearchResult[].cityLimitsDoorService.gabaritesMaxheight
export type Pin1175 = Assert<Eq<keyof NonNullable<T.CountrySearchRequestBody>, 'filters'>>; // CountrySearchRequestBody keys
export type Pin1176 = Assert<Eq<Req<NonNullable<T.CountrySearchRequestBody>>, never>>; // CountrySearchRequestBody required
export type Pin1177 = Assert<
  Eq<keyof NonNullable<NonNullable<T.CountrySearchRequestBody>['filters']>, 'countryID' | 'countryDescr'>
>; // CountrySearchRequestBody.filters keys
export type Pin1178 = Assert<Eq<Req<NonNullable<NonNullable<T.CountrySearchRequestBody>['filters']>>, never>>; // CountrySearchRequestBody.filters required
export type Pin1179 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<T.CountrySearchRequestBody>['filters']>['countryID']>, string>
>; // CountrySearchRequestBody.filters.countryID
export type Pin1180 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<T.CountrySearchRequestBody>['filters']>['countryDescr']>, string>
>; // CountrySearchRequestBody.filters.countryDescr
export type Pin1181 = Assert<
  Eq<keyof NonNullable<NonNullable<T.CountrySearchResult>[number]>, 'countryID' | 'countryDescr' | 'alfaCode2'>
>; // CountrySearchResult[] keys
export type Pin1182 = Assert<Eq<Req<NonNullable<NonNullable<T.CountrySearchResult>[number]>>, never>>; // CountrySearchResult[] required
export type Pin1183 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<T.CountrySearchResult>[number]>['countryID']>, string>
>; // CountrySearchResult[].countryID
export type Pin1184 = Assert<
  Eq<
    keyof NonNullable<NonNullable<NonNullable<T.CountrySearchResult>[number]>['countryDescr']>,
    'descrUA' | 'descrRU' | 'descrEN'
  >
>; // CountrySearchResult[].countryDescr keys
export type Pin1185 = Assert<
  Eq<Req<NonNullable<NonNullable<NonNullable<T.CountrySearchResult>[number]>['countryDescr']>>, never>
>; // CountrySearchResult[].countryDescr required
export type Pin1186 = Assert<
  Eq<
    NonNullable<NonNullable<NonNullable<NonNullable<T.CountrySearchResult>[number]>['countryDescr']>['descrUA']>,
    string
  >
>; // CountrySearchResult[].countryDescr.descrUA
export type Pin1187 = Assert<
  Eq<
    NonNullable<NonNullable<NonNullable<NonNullable<T.CountrySearchResult>[number]>['countryDescr']>['descrRU']>,
    string
  >
>; // CountrySearchResult[].countryDescr.descrRU
export type Pin1188 = Assert<
  Eq<
    NonNullable<NonNullable<NonNullable<NonNullable<T.CountrySearchResult>[number]>['countryDescr']>['descrEN']>,
    string
  >
>; // CountrySearchResult[].countryDescr.descrEN
export type Pin1189 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<T.CountrySearchResult>[number]>['alfaCode2']>, string>
>; // CountrySearchResult[].alfaCode2
export type Pin1190 = Assert<Eq<keyof NonNullable<T.DistrictSearchRequestBody>, 'filters'>>; // DistrictSearchRequestBody keys
export type Pin1191 = Assert<Eq<Req<NonNullable<T.DistrictSearchRequestBody>>, never>>; // DistrictSearchRequestBody required
export type Pin1192 = Assert<
  Eq<
    keyof NonNullable<NonNullable<T.DistrictSearchRequestBody>['filters']>,
    'districtID' | 'districtDescr' | 'regionID' | 'regionDescr' | 'districtKATUU'
  >
>; // DistrictSearchRequestBody.filters keys
export type Pin1193 = Assert<Eq<Req<NonNullable<NonNullable<T.DistrictSearchRequestBody>['filters']>>, never>>; // DistrictSearchRequestBody.filters required
export type Pin1194 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<T.DistrictSearchRequestBody>['filters']>['districtID']>, string>
>; // DistrictSearchRequestBody.filters.districtID
export type Pin1195 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<T.DistrictSearchRequestBody>['filters']>['districtDescr']>, string>
>; // DistrictSearchRequestBody.filters.districtDescr
export type Pin1196 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<T.DistrictSearchRequestBody>['filters']>['regionID']>, string>
>; // DistrictSearchRequestBody.filters.regionID
export type Pin1197 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<T.DistrictSearchRequestBody>['filters']>['regionDescr']>, string>
>; // DistrictSearchRequestBody.filters.regionDescr
export type Pin1198 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<T.DistrictSearchRequestBody>['filters']>['districtKATUU']>, string>
>; // DistrictSearchRequestBody.filters.districtKATUU
export type Pin1199 = Assert<
  Eq<
    keyof NonNullable<NonNullable<T.DistrictSearchResult>[number]>,
    'districtID' | 'districtKATUU' | 'districtDescr' | 'regionID' | 'regionDescr'
  >
>; // DistrictSearchResult[] keys
export type Pin1200 = Assert<Eq<Req<NonNullable<NonNullable<T.DistrictSearchResult>[number]>>, never>>; // DistrictSearchResult[] required
export type Pin1201 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<T.DistrictSearchResult>[number]>['districtID']>, string>
>; // DistrictSearchResult[].districtID
export type Pin1202 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<T.DistrictSearchResult>[number]>['districtKATUU']>, string>
>; // DistrictSearchResult[].districtKATUU
export type Pin1203 = Assert<
  Eq<
    keyof NonNullable<NonNullable<NonNullable<T.DistrictSearchResult>[number]>['districtDescr']>,
    'descrUA' | 'descrRU' | 'descrEN'
  >
>; // DistrictSearchResult[].districtDescr keys
export type Pin1204 = Assert<
  Eq<Req<NonNullable<NonNullable<NonNullable<T.DistrictSearchResult>[number]>['districtDescr']>>, never>
>; // DistrictSearchResult[].districtDescr required
export type Pin1205 = Assert<
  Eq<
    NonNullable<NonNullable<NonNullable<NonNullable<T.DistrictSearchResult>[number]>['districtDescr']>['descrUA']>,
    string
  >
>; // DistrictSearchResult[].districtDescr.descrUA
export type Pin1206 = Assert<
  Eq<
    NonNullable<NonNullable<NonNullable<NonNullable<T.DistrictSearchResult>[number]>['districtDescr']>['descrRU']>,
    string
  >
>; // DistrictSearchResult[].districtDescr.descrRU
export type Pin1207 = Assert<
  Eq<
    NonNullable<NonNullable<NonNullable<NonNullable<T.DistrictSearchResult>[number]>['districtDescr']>['descrEN']>,
    string
  >
>; // DistrictSearchResult[].districtDescr.descrEN
export type Pin1208 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<T.DistrictSearchResult>[number]>['regionID']>, string>
>; // DistrictSearchResult[].regionID
export type Pin1209 = Assert<
  Eq<
    keyof NonNullable<NonNullable<NonNullable<T.DistrictSearchResult>[number]>['regionDescr']>,
    'descrUA' | 'descrRU' | 'descrEN'
  >
>; // DistrictSearchResult[].regionDescr keys
export type Pin1210 = Assert<
  Eq<Req<NonNullable<NonNullable<NonNullable<T.DistrictSearchResult>[number]>['regionDescr']>>, never>
>; // DistrictSearchResult[].regionDescr required
export type Pin1211 = Assert<
  Eq<
    NonNullable<NonNullable<NonNullable<NonNullable<T.DistrictSearchResult>[number]>['regionDescr']>['descrUA']>,
    string
  >
>; // DistrictSearchResult[].regionDescr.descrUA
export type Pin1212 = Assert<
  Eq<
    NonNullable<NonNullable<NonNullable<NonNullable<T.DistrictSearchResult>[number]>['regionDescr']>['descrRU']>,
    string
  >
>; // DistrictSearchResult[].regionDescr.descrRU
export type Pin1213 = Assert<
  Eq<
    NonNullable<NonNullable<NonNullable<NonNullable<T.DistrictSearchResult>[number]>['regionDescr']>['descrEN']>,
    string
  >
>; // DistrictSearchResult[].regionDescr.descrEN
export type Pin1214 = Assert<Eq<keyof T.PayTerminalSearchPathParams, 'latitude' | 'longitude' | 'radius'>>; // PayTerminalSearchPathParams keys
export type Pin1215 = Assert<Eq<Req<T.PayTerminalSearchPathParams>, 'latitude' | 'longitude' | 'radius'>>; // PayTerminalSearchPathParams required
export type Pin1216 = Assert<Eq<NonNullable<T.PayTerminalSearchPathParams['latitude']>, number>>; // PayTerminalSearchPathParams.latitude
export type Pin1217 = Assert<Eq<NonNullable<T.PayTerminalSearchPathParams['longitude']>, number>>; // PayTerminalSearchPathParams.longitude
export type Pin1218 = Assert<Eq<NonNullable<T.PayTerminalSearchPathParams['radius']>, number>>; // PayTerminalSearchPathParams.radius
export type Pin1219 = Assert<
  Eq<
    keyof NonNullable<NonNullable<T.PayTerminalSearchResult>[number]>,
    | 'type'
    | 'longitude'
    | 'latitude'
    | 'payTerminalDescr'
    | 'workingHours'
    | 'cityDescr'
    | 'addressDescr'
    | 'addressMoreInformationDescr'
  >
>; // PayTerminalSearchResult[] keys
export type Pin1220 = Assert<Eq<Req<NonNullable<NonNullable<T.PayTerminalSearchResult>[number]>>, never>>; // PayTerminalSearchResult[] required
export type Pin1221 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<T.PayTerminalSearchResult>[number]>['type']>, string>
>; // PayTerminalSearchResult[].type
export type Pin1222 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<T.PayTerminalSearchResult>[number]>['longitude']>, string>
>; // PayTerminalSearchResult[].longitude
export type Pin1223 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<T.PayTerminalSearchResult>[number]>['latitude']>, string>
>; // PayTerminalSearchResult[].latitude
export type Pin1224 = Assert<
  Eq<
    keyof NonNullable<NonNullable<NonNullable<T.PayTerminalSearchResult>[number]>['payTerminalDescr']>,
    'descrUA' | 'descrRU'
  >
>; // PayTerminalSearchResult[].payTerminalDescr keys
export type Pin1225 = Assert<
  Eq<Req<NonNullable<NonNullable<NonNullable<T.PayTerminalSearchResult>[number]>['payTerminalDescr']>>, never>
>; // PayTerminalSearchResult[].payTerminalDescr required
export type Pin1226 = Assert<
  Eq<
    NonNullable<
      NonNullable<NonNullable<NonNullable<T.PayTerminalSearchResult>[number]>['payTerminalDescr']>['descrUA']
    >,
    string
  >
>; // PayTerminalSearchResult[].payTerminalDescr.descrUA
export type Pin1227 = Assert<
  Eq<
    NonNullable<
      NonNullable<NonNullable<NonNullable<T.PayTerminalSearchResult>[number]>['payTerminalDescr']>['descrRU']
    >,
    string
  >
>; // PayTerminalSearchResult[].payTerminalDescr.descrRU
export type Pin1228 = Assert<
  Eq<
    keyof NonNullable<NonNullable<NonNullable<T.PayTerminalSearchResult>[number]>['workingHours']>,
    'descrUA' | 'descrRU'
  >
>; // PayTerminalSearchResult[].workingHours keys
export type Pin1229 = Assert<
  Eq<Req<NonNullable<NonNullable<NonNullable<T.PayTerminalSearchResult>[number]>['workingHours']>>, never>
>; // PayTerminalSearchResult[].workingHours required
export type Pin1230 = Assert<
  Eq<
    NonNullable<NonNullable<NonNullable<NonNullable<T.PayTerminalSearchResult>[number]>['workingHours']>['descrUA']>,
    string
  >
>; // PayTerminalSearchResult[].workingHours.descrUA
export type Pin1231 = Assert<
  Eq<
    NonNullable<NonNullable<NonNullable<NonNullable<T.PayTerminalSearchResult>[number]>['workingHours']>['descrRU']>,
    string
  >
>; // PayTerminalSearchResult[].workingHours.descrRU
export type Pin1232 = Assert<
  Eq<keyof NonNullable<NonNullable<NonNullable<T.PayTerminalSearchResult>[number]>['cityDescr']>, 'descrUA' | 'descrRU'>
>; // PayTerminalSearchResult[].cityDescr keys
export type Pin1233 = Assert<
  Eq<Req<NonNullable<NonNullable<NonNullable<T.PayTerminalSearchResult>[number]>['cityDescr']>>, never>
>; // PayTerminalSearchResult[].cityDescr required
export type Pin1234 = Assert<
  Eq<
    NonNullable<NonNullable<NonNullable<NonNullable<T.PayTerminalSearchResult>[number]>['cityDescr']>['descrUA']>,
    string
  >
>; // PayTerminalSearchResult[].cityDescr.descrUA
export type Pin1235 = Assert<
  Eq<
    NonNullable<NonNullable<NonNullable<NonNullable<T.PayTerminalSearchResult>[number]>['cityDescr']>['descrRU']>,
    string
  >
>; // PayTerminalSearchResult[].cityDescr.descrRU
export type Pin1236 = Assert<
  Eq<
    keyof NonNullable<NonNullable<NonNullable<T.PayTerminalSearchResult>[number]>['addressDescr']>,
    'descrUA' | 'descrRU'
  >
>; // PayTerminalSearchResult[].addressDescr keys
export type Pin1237 = Assert<
  Eq<Req<NonNullable<NonNullable<NonNullable<T.PayTerminalSearchResult>[number]>['addressDescr']>>, never>
>; // PayTerminalSearchResult[].addressDescr required
export type Pin1238 = Assert<
  Eq<
    NonNullable<NonNullable<NonNullable<NonNullable<T.PayTerminalSearchResult>[number]>['addressDescr']>['descrUA']>,
    string
  >
>; // PayTerminalSearchResult[].addressDescr.descrUA
export type Pin1239 = Assert<
  Eq<
    NonNullable<NonNullable<NonNullable<NonNullable<T.PayTerminalSearchResult>[number]>['addressDescr']>['descrRU']>,
    string
  >
>; // PayTerminalSearchResult[].addressDescr.descrRU
export type Pin1240 = Assert<
  Eq<
    keyof NonNullable<NonNullable<NonNullable<T.PayTerminalSearchResult>[number]>['addressMoreInformationDescr']>,
    'descrUA' | 'descrRU'
  >
>; // PayTerminalSearchResult[].addressMoreInformationDescr keys
export type Pin1241 = Assert<
  Eq<
    Req<NonNullable<NonNullable<NonNullable<T.PayTerminalSearchResult>[number]>['addressMoreInformationDescr']>>,
    never
  >
>; // PayTerminalSearchResult[].addressMoreInformationDescr required
export type Pin1242 = Assert<
  Eq<
    NonNullable<
      NonNullable<NonNullable<NonNullable<T.PayTerminalSearchResult>[number]>['addressMoreInformationDescr']>['descrUA']
    >,
    string
  >
>; // PayTerminalSearchResult[].addressMoreInformationDescr.descrUA
export type Pin1243 = Assert<
  Eq<
    NonNullable<
      NonNullable<NonNullable<NonNullable<T.PayTerminalSearchResult>[number]>['addressMoreInformationDescr']>['descrRU']
    >,
    string
  >
>; // PayTerminalSearchResult[].addressMoreInformationDescr.descrRU
export type Pin1244 = Assert<Eq<keyof NonNullable<T.RegionSearchRequestBody>, 'filters'>>; // RegionSearchRequestBody keys
export type Pin1245 = Assert<Eq<Req<NonNullable<T.RegionSearchRequestBody>>, never>>; // RegionSearchRequestBody required
export type Pin1246 = Assert<
  Eq<
    keyof NonNullable<NonNullable<T.RegionSearchRequestBody>['filters']>,
    'regionID' | 'regionKATUU' | 'regionDescr' | 'countryID' | 'countryDescr'
  >
>; // RegionSearchRequestBody.filters keys
export type Pin1247 = Assert<Eq<Req<NonNullable<NonNullable<T.RegionSearchRequestBody>['filters']>>, never>>; // RegionSearchRequestBody.filters required
export type Pin1248 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<T.RegionSearchRequestBody>['filters']>['regionID']>, string>
>; // RegionSearchRequestBody.filters.regionID
export type Pin1249 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<T.RegionSearchRequestBody>['filters']>['regionKATUU']>, string>
>; // RegionSearchRequestBody.filters.regionKATUU
export type Pin1250 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<T.RegionSearchRequestBody>['filters']>['regionDescr']>, string>
>; // RegionSearchRequestBody.filters.regionDescr
export type Pin1251 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<T.RegionSearchRequestBody>['filters']>['countryID']>, string>
>; // RegionSearchRequestBody.filters.countryID
export type Pin1252 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<T.RegionSearchRequestBody>['filters']>['countryDescr']>, string>
>; // RegionSearchRequestBody.filters.countryDescr
export type Pin1253 = Assert<
  Eq<
    keyof NonNullable<NonNullable<T.RegionSearchResult>[number]>,
    'regionID' | 'regionKATUU' | 'displayExport' | 'regionDescr' | 'countryID' | 'countryDescr'
  >
>; // RegionSearchResult[] keys
export type Pin1254 = Assert<Eq<Req<NonNullable<NonNullable<T.RegionSearchResult>[number]>>, never>>; // RegionSearchResult[] required
export type Pin1255 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<T.RegionSearchResult>[number]>['regionID']>, string>
>; // RegionSearchResult[].regionID
export type Pin1256 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<T.RegionSearchResult>[number]>['regionKATUU']>, string>
>; // RegionSearchResult[].regionKATUU
export type Pin1257 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<T.RegionSearchResult>[number]>['displayExport']>, boolean>
>; // RegionSearchResult[].displayExport
export type Pin1258 = Assert<
  Eq<
    keyof NonNullable<NonNullable<NonNullable<T.RegionSearchResult>[number]>['regionDescr']>,
    'descrUA' | 'descrRU' | 'descrEN'
  >
>; // RegionSearchResult[].regionDescr keys
export type Pin1259 = Assert<
  Eq<Req<NonNullable<NonNullable<NonNullable<T.RegionSearchResult>[number]>['regionDescr']>>, never>
>; // RegionSearchResult[].regionDescr required
export type Pin1260 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<NonNullable<T.RegionSearchResult>[number]>['regionDescr']>['descrUA']>, string>
>; // RegionSearchResult[].regionDescr.descrUA
export type Pin1261 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<NonNullable<T.RegionSearchResult>[number]>['regionDescr']>['descrRU']>, string>
>; // RegionSearchResult[].regionDescr.descrRU
export type Pin1262 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<NonNullable<T.RegionSearchResult>[number]>['regionDescr']>['descrEN']>, string>
>; // RegionSearchResult[].regionDescr.descrEN
export type Pin1263 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<T.RegionSearchResult>[number]>['countryID']>, string>
>; // RegionSearchResult[].countryID
export type Pin1264 = Assert<
  Eq<
    keyof NonNullable<NonNullable<NonNullable<T.RegionSearchResult>[number]>['countryDescr']>,
    'descrUA' | 'descrRU' | 'descrEN'
  >
>; // RegionSearchResult[].countryDescr keys
export type Pin1265 = Assert<
  Eq<Req<NonNullable<NonNullable<NonNullable<T.RegionSearchResult>[number]>['countryDescr']>>, never>
>; // RegionSearchResult[].countryDescr required
export type Pin1266 = Assert<
  Eq<
    NonNullable<NonNullable<NonNullable<NonNullable<T.RegionSearchResult>[number]>['countryDescr']>['descrUA']>,
    string
  >
>; // RegionSearchResult[].countryDescr.descrUA
export type Pin1267 = Assert<
  Eq<
    NonNullable<NonNullable<NonNullable<NonNullable<T.RegionSearchResult>[number]>['countryDescr']>['descrRU']>,
    string
  >
>; // RegionSearchResult[].countryDescr.descrRU
export type Pin1268 = Assert<
  Eq<
    NonNullable<NonNullable<NonNullable<NonNullable<T.RegionSearchResult>[number]>['countryDescr']>['descrEN']>,
    string
  >
>; // RegionSearchResult[].countryDescr.descrEN
export type Pin1269 = Assert<Eq<keyof T.ZipCodeSearchPathParams, 'zipCode'>>; // ZipCodeSearchPathParams keys
export type Pin1270 = Assert<Eq<Req<T.ZipCodeSearchPathParams>, 'zipCode'>>; // ZipCodeSearchPathParams required
export type Pin1271 = Assert<Eq<NonNullable<T.ZipCodeSearchPathParams['zipCode']>, string>>; // ZipCodeSearchPathParams.zipCode
export type Pin1272 = Assert<
  Eq<
    keyof NonNullable<NonNullable<T.ZipCodeSearchResult>[number]>,
    | 'zipCode'
    | 'cityID'
    | 'cityDescr'
    | 'districtID'
    | 'districtDescr'
    | 'regionID'
    | 'regionDescr'
    | 'countryID'
    | 'isBranchInCity'
    | 'deliveryZone'
    | 'deliveryDays'
  >
>; // ZipCodeSearchResult[] keys
export type Pin1273 = Assert<Eq<Req<NonNullable<NonNullable<T.ZipCodeSearchResult>[number]>>, never>>; // ZipCodeSearchResult[] required
export type Pin1274 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<T.ZipCodeSearchResult>[number]>['zipCode']>, string>
>; // ZipCodeSearchResult[].zipCode
export type Pin1275 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<T.ZipCodeSearchResult>[number]>['cityID']>, string>
>; // ZipCodeSearchResult[].cityID
export type Pin1276 = Assert<
  Eq<
    keyof NonNullable<NonNullable<NonNullable<T.ZipCodeSearchResult>[number]>['cityDescr']>,
    'descrUA' | 'descrRU' | 'descrEN'
  >
>; // ZipCodeSearchResult[].cityDescr keys
export type Pin1277 = Assert<
  Eq<Req<NonNullable<NonNullable<NonNullable<T.ZipCodeSearchResult>[number]>['cityDescr']>>, never>
>; // ZipCodeSearchResult[].cityDescr required
export type Pin1278 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<NonNullable<T.ZipCodeSearchResult>[number]>['cityDescr']>['descrUA']>, string>
>; // ZipCodeSearchResult[].cityDescr.descrUA
export type Pin1279 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<NonNullable<T.ZipCodeSearchResult>[number]>['cityDescr']>['descrRU']>, string>
>; // ZipCodeSearchResult[].cityDescr.descrRU
export type Pin1280 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<NonNullable<T.ZipCodeSearchResult>[number]>['cityDescr']>['descrEN']>, string>
>; // ZipCodeSearchResult[].cityDescr.descrEN
export type Pin1281 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<T.ZipCodeSearchResult>[number]>['districtID']>, string>
>; // ZipCodeSearchResult[].districtID
export type Pin1282 = Assert<
  Eq<
    keyof NonNullable<NonNullable<NonNullable<T.ZipCodeSearchResult>[number]>['districtDescr']>,
    'descrUA' | 'descrRU' | 'descrEN'
  >
>; // ZipCodeSearchResult[].districtDescr keys
export type Pin1283 = Assert<
  Eq<Req<NonNullable<NonNullable<NonNullable<T.ZipCodeSearchResult>[number]>['districtDescr']>>, never>
>; // ZipCodeSearchResult[].districtDescr required
export type Pin1284 = Assert<
  Eq<
    NonNullable<NonNullable<NonNullable<NonNullable<T.ZipCodeSearchResult>[number]>['districtDescr']>['descrUA']>,
    string
  >
>; // ZipCodeSearchResult[].districtDescr.descrUA
export type Pin1285 = Assert<
  Eq<
    NonNullable<NonNullable<NonNullable<NonNullable<T.ZipCodeSearchResult>[number]>['districtDescr']>['descrRU']>,
    string
  >
>; // ZipCodeSearchResult[].districtDescr.descrRU
export type Pin1286 = Assert<
  Eq<
    NonNullable<NonNullable<NonNullable<NonNullable<T.ZipCodeSearchResult>[number]>['districtDescr']>['descrEN']>,
    string
  >
>; // ZipCodeSearchResult[].districtDescr.descrEN
export type Pin1287 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<T.ZipCodeSearchResult>[number]>['regionID']>, string>
>; // ZipCodeSearchResult[].regionID
export type Pin1288 = Assert<
  Eq<
    keyof NonNullable<NonNullable<NonNullable<T.ZipCodeSearchResult>[number]>['regionDescr']>,
    'descrUA' | 'descrRU' | 'descrEN'
  >
>; // ZipCodeSearchResult[].regionDescr keys
export type Pin1289 = Assert<
  Eq<Req<NonNullable<NonNullable<NonNullable<T.ZipCodeSearchResult>[number]>['regionDescr']>>, never>
>; // ZipCodeSearchResult[].regionDescr required
export type Pin1290 = Assert<
  Eq<
    NonNullable<NonNullable<NonNullable<NonNullable<T.ZipCodeSearchResult>[number]>['regionDescr']>['descrUA']>,
    string
  >
>; // ZipCodeSearchResult[].regionDescr.descrUA
export type Pin1291 = Assert<
  Eq<
    NonNullable<NonNullable<NonNullable<NonNullable<T.ZipCodeSearchResult>[number]>['regionDescr']>['descrRU']>,
    string
  >
>; // ZipCodeSearchResult[].regionDescr.descrRU
export type Pin1292 = Assert<
  Eq<
    NonNullable<NonNullable<NonNullable<NonNullable<T.ZipCodeSearchResult>[number]>['regionDescr']>['descrEN']>,
    string
  >
>; // ZipCodeSearchResult[].regionDescr.descrEN
export type Pin1293 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<T.ZipCodeSearchResult>[number]>['countryID']>, string>
>; // ZipCodeSearchResult[].countryID
export type Pin1294 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<T.ZipCodeSearchResult>[number]>['isBranchInCity']>, boolean>
>; // ZipCodeSearchResult[].isBranchInCity
export type Pin1295 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<T.ZipCodeSearchResult>[number]>['deliveryZone']>, number>
>; // ZipCodeSearchResult[].deliveryZone
export type Pin1296 = Assert<
  Eq<
    keyof NonNullable<NonNullable<NonNullable<T.ZipCodeSearchResult>[number]>['deliveryDays']>,
    'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun'
  >
>; // ZipCodeSearchResult[].deliveryDays keys
export type Pin1297 = Assert<
  Eq<Req<NonNullable<NonNullable<NonNullable<T.ZipCodeSearchResult>[number]>['deliveryDays']>>, never>
>; // ZipCodeSearchResult[].deliveryDays required
export type Pin1298 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<NonNullable<T.ZipCodeSearchResult>[number]>['deliveryDays']>['Mon']>, boolean>
>; // ZipCodeSearchResult[].deliveryDays.Mon
export type Pin1299 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<NonNullable<T.ZipCodeSearchResult>[number]>['deliveryDays']>['Tue']>, boolean>
>; // ZipCodeSearchResult[].deliveryDays.Tue
export type Pin1300 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<NonNullable<T.ZipCodeSearchResult>[number]>['deliveryDays']>['Wed']>, boolean>
>; // ZipCodeSearchResult[].deliveryDays.Wed
export type Pin1301 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<NonNullable<T.ZipCodeSearchResult>[number]>['deliveryDays']>['Thu']>, boolean>
>; // ZipCodeSearchResult[].deliveryDays.Thu
export type Pin1302 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<NonNullable<T.ZipCodeSearchResult>[number]>['deliveryDays']>['Fri']>, boolean>
>; // ZipCodeSearchResult[].deliveryDays.Fri
export type Pin1303 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<NonNullable<T.ZipCodeSearchResult>[number]>['deliveryDays']>['Sat']>, boolean>
>; // ZipCodeSearchResult[].deliveryDays.Sat
export type Pin1304 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<NonNullable<T.ZipCodeSearchResult>[number]>['deliveryDays']>['Sun']>, boolean>
>; // ZipCodeSearchResult[].deliveryDays.Sun
export type Pin1305 = Assert<Eq<keyof T.ParcelInfoTrackingPathParams, 'parcelID'>>; // ParcelInfoTrackingPathParams keys
export type Pin1306 = Assert<Eq<Req<T.ParcelInfoTrackingPathParams>, 'parcelID'>>; // ParcelInfoTrackingPathParams required
export type Pin1307 = Assert<Eq<NonNullable<T.ParcelInfoTrackingPathParams['parcelID']>, string>>; // ParcelInfoTrackingPathParams.parcelID
export type Pin1308 = Assert<
  Eq<
    keyof NonNullable<NonNullable<T.ParcelInfoTrackingResult>[number]>,
    | 'parcelID'
    | 'parcelIDref'
    | 'parcelNumber'
    | 'barCode'
    | 'PDD'
    | 'JIT0'
    | 'sender'
    | 'receiver'
    | 'DetailingParcelItems'
    | 'OSM_ID'
    | 'InboundRestriction'
    | 'InboundRestrictionStartDate'
    | 'InboundRestrictionEndDate'
    | 'FactDeliveryDate'
  >
>; // ParcelInfoTrackingResult[] keys
export type Pin1309 = Assert<Eq<Req<NonNullable<NonNullable<T.ParcelInfoTrackingResult>[number]>>, never>>; // ParcelInfoTrackingResult[] required
export type Pin1310 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<T.ParcelInfoTrackingResult>[number]>['parcelID']>, string>
>; // ParcelInfoTrackingResult[].parcelID
export type Pin1311 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<T.ParcelInfoTrackingResult>[number]>['parcelIDref']>, string>
>; // ParcelInfoTrackingResult[].parcelIDref
export type Pin1312 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<T.ParcelInfoTrackingResult>[number]>['parcelNumber']>, string>
>; // ParcelInfoTrackingResult[].parcelNumber
export type Pin1313 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<T.ParcelInfoTrackingResult>[number]>['barCode']>, string>
>; // ParcelInfoTrackingResult[].barCode
export type Pin1314 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<T.ParcelInfoTrackingResult>[number]>['PDD']>, string>
>; // ParcelInfoTrackingResult[].PDD
export type Pin1315 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<T.ParcelInfoTrackingResult>[number]>['JIT0']>, string>
>; // ParcelInfoTrackingResult[].JIT0
export type Pin1316 = Assert<
  Eq<
    keyof NonNullable<NonNullable<NonNullable<T.ParcelInfoTrackingResult>[number]>['sender']>,
    'name' | 'phone' | 'cityUA' | 'paymentMethods'
  >
>; // ParcelInfoTrackingResult[].sender keys
export type Pin1317 = Assert<
  Eq<Req<NonNullable<NonNullable<NonNullable<T.ParcelInfoTrackingResult>[number]>['sender']>>, never>
>; // ParcelInfoTrackingResult[].sender required
export type Pin1318 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<NonNullable<T.ParcelInfoTrackingResult>[number]>['sender']>['name']>, string>
>; // ParcelInfoTrackingResult[].sender.name
export type Pin1319 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<NonNullable<T.ParcelInfoTrackingResult>[number]>['sender']>['phone']>, string>
>; // ParcelInfoTrackingResult[].sender.phone
export type Pin1320 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<NonNullable<T.ParcelInfoTrackingResult>[number]>['sender']>['cityUA']>, string>
>; // ParcelInfoTrackingResult[].sender.cityUA
export type Pin1321 = Assert<
  Eq<
    keyof NonNullable<
      NonNullable<
        NonNullable<NonNullable<NonNullable<T.ParcelInfoTrackingResult>[number]>['sender']>['paymentMethods']
      >[number]
    >,
    'uid' | 'nameUkr'
  >
>; // ParcelInfoTrackingResult[].sender.paymentMethods[] keys
export type Pin1322 = Assert<
  Eq<
    Req<
      NonNullable<
        NonNullable<
          NonNullable<NonNullable<NonNullable<T.ParcelInfoTrackingResult>[number]>['sender']>['paymentMethods']
        >[number]
      >
    >,
    never
  >
>; // ParcelInfoTrackingResult[].sender.paymentMethods[] required
export type Pin1323 = Assert<
  Eq<
    NonNullable<
      NonNullable<
        NonNullable<
          NonNullable<NonNullable<NonNullable<T.ParcelInfoTrackingResult>[number]>['sender']>['paymentMethods']
        >[number]
      >['uid']
    >,
    string
  >
>; // ParcelInfoTrackingResult[].sender.paymentMethods[].uid
export type Pin1324 = Assert<
  Eq<
    NonNullable<
      NonNullable<
        NonNullable<
          NonNullable<NonNullable<NonNullable<T.ParcelInfoTrackingResult>[number]>['sender']>['paymentMethods']
        >[number]
      >['nameUkr']
    >,
    string
  >
>; // ParcelInfoTrackingResult[].sender.paymentMethods[].nameUkr
export type Pin1325 = Assert<
  Eq<
    keyof NonNullable<NonNullable<NonNullable<T.ParcelInfoTrackingResult>[number]>['receiver']>,
    'name' | 'phone' | 'cityUA' | 'paymentMethods'
  >
>; // ParcelInfoTrackingResult[].receiver keys
export type Pin1326 = Assert<
  Eq<Req<NonNullable<NonNullable<NonNullable<T.ParcelInfoTrackingResult>[number]>['receiver']>>, never>
>; // ParcelInfoTrackingResult[].receiver required
export type Pin1327 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<NonNullable<T.ParcelInfoTrackingResult>[number]>['receiver']>['name']>, string>
>; // ParcelInfoTrackingResult[].receiver.name
export type Pin1328 = Assert<
  Eq<
    NonNullable<NonNullable<NonNullable<NonNullable<T.ParcelInfoTrackingResult>[number]>['receiver']>['phone']>,
    string
  >
>; // ParcelInfoTrackingResult[].receiver.phone
export type Pin1329 = Assert<
  Eq<
    NonNullable<NonNullable<NonNullable<NonNullable<T.ParcelInfoTrackingResult>[number]>['receiver']>['cityUA']>,
    string
  >
>; // ParcelInfoTrackingResult[].receiver.cityUA
export type Pin1330 = Assert<
  Eq<
    keyof NonNullable<
      NonNullable<
        NonNullable<NonNullable<NonNullable<T.ParcelInfoTrackingResult>[number]>['receiver']>['paymentMethods']
      >[number]
    >,
    'uid' | 'nameUkr'
  >
>; // ParcelInfoTrackingResult[].receiver.paymentMethods[] keys
export type Pin1331 = Assert<
  Eq<
    Req<
      NonNullable<
        NonNullable<
          NonNullable<NonNullable<NonNullable<T.ParcelInfoTrackingResult>[number]>['receiver']>['paymentMethods']
        >[number]
      >
    >,
    never
  >
>; // ParcelInfoTrackingResult[].receiver.paymentMethods[] required
export type Pin1332 = Assert<
  Eq<
    NonNullable<
      NonNullable<
        NonNullable<
          NonNullable<NonNullable<NonNullable<T.ParcelInfoTrackingResult>[number]>['receiver']>['paymentMethods']
        >[number]
      >['uid']
    >,
    string
  >
>; // ParcelInfoTrackingResult[].receiver.paymentMethods[].uid
export type Pin1333 = Assert<
  Eq<
    NonNullable<
      NonNullable<
        NonNullable<
          NonNullable<NonNullable<NonNullable<T.ParcelInfoTrackingResult>[number]>['receiver']>['paymentMethods']
        >[number]
      >['nameUkr']
    >,
    string
  >
>; // ParcelInfoTrackingResult[].receiver.paymentMethods[].nameUkr
export type Pin1334 = Assert<
  Eq<
    keyof NonNullable<
      NonNullable<NonNullable<NonNullable<T.ParcelInfoTrackingResult>[number]>['DetailingParcelItems']>[number]
    >,
    'formatName' | 'weight' | 'insurance'
  >
>; // ParcelInfoTrackingResult[].DetailingParcelItems[] keys
export type Pin1335 = Assert<
  Eq<
    Req<
      NonNullable<
        NonNullable<NonNullable<NonNullable<T.ParcelInfoTrackingResult>[number]>['DetailingParcelItems']>[number]
      >
    >,
    never
  >
>; // ParcelInfoTrackingResult[].DetailingParcelItems[] required
export type Pin1336 = Assert<
  Eq<
    NonNullable<
      NonNullable<
        NonNullable<NonNullable<NonNullable<T.ParcelInfoTrackingResult>[number]>['DetailingParcelItems']>[number]
      >['formatName']
    >,
    string
  >
>; // ParcelInfoTrackingResult[].DetailingParcelItems[].formatName
export type Pin1337 = Assert<
  Eq<
    NonNullable<
      NonNullable<
        NonNullable<NonNullable<NonNullable<T.ParcelInfoTrackingResult>[number]>['DetailingParcelItems']>[number]
      >['weight']
    >,
    number
  >
>; // ParcelInfoTrackingResult[].DetailingParcelItems[].weight
export type Pin1338 = Assert<
  Eq<
    NonNullable<
      NonNullable<
        NonNullable<NonNullable<NonNullable<T.ParcelInfoTrackingResult>[number]>['DetailingParcelItems']>[number]
      >['insurance']
    >,
    number
  >
>; // ParcelInfoTrackingResult[].DetailingParcelItems[].insurance
export type Pin1339 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<T.ParcelInfoTrackingResult>[number]>['OSM_ID']>, string>
>; // ParcelInfoTrackingResult[].OSM_ID
export type Pin1340 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<T.ParcelInfoTrackingResult>[number]>['InboundRestriction']>, boolean>
>; // ParcelInfoTrackingResult[].InboundRestriction
export type Pin1341 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<T.ParcelInfoTrackingResult>[number]>['InboundRestrictionStartDate']>, string>
>; // ParcelInfoTrackingResult[].InboundRestrictionStartDate
export type Pin1342 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<T.ParcelInfoTrackingResult>[number]>['InboundRestrictionEndDate']>, string>
>; // ParcelInfoTrackingResult[].InboundRestrictionEndDate
export type Pin1343 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<T.ParcelInfoTrackingResult>[number]>['FactDeliveryDate']>, string>
>; // ParcelInfoTrackingResult[].FactDeliveryDate
export type Pin1344 = Assert<Eq<keyof T.TrackingPathParams, 'trackNumber'>>; // TrackingPathParams keys
export type Pin1345 = Assert<Eq<Req<T.TrackingPathParams>, 'trackNumber'>>; // TrackingPathParams required
export type Pin1346 = Assert<Eq<NonNullable<T.TrackingPathParams['trackNumber']>, string>>; // TrackingPathParams.trackNumber
export type Pin1347 = Assert<
  Eq<
    keyof NonNullable<NonNullable<T.TrackingResult>[number]>,
    | 'parcelNumber'
    | 'barCode'
    | 'eventDateTime'
    | 'eventCode'
    | 'eventCodeUPU'
    | 'eventPlaces'
    | 'eventCountryDescr'
    | 'eventCityDescr'
    | 'eventDescr'
    | 'eventDetailDescr'
  >
>; // TrackingResult[] keys
export type Pin1348 = Assert<Eq<Req<NonNullable<NonNullable<T.TrackingResult>[number]>>, never>>; // TrackingResult[] required
export type Pin1349 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<T.TrackingResult>[number]>['parcelNumber']>, string>
>; // TrackingResult[].parcelNumber
export type Pin1350 = Assert<Eq<NonNullable<NonNullable<NonNullable<T.TrackingResult>[number]>['barCode']>, string>>; // TrackingResult[].barCode
export type Pin1351 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<T.TrackingResult>[number]>['eventDateTime']>, string>
>; // TrackingResult[].eventDateTime
export type Pin1352 = Assert<Eq<NonNullable<NonNullable<NonNullable<T.TrackingResult>[number]>['eventCode']>, number>>; // TrackingResult[].eventCode
export type Pin1353 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<T.TrackingResult>[number]>['eventCodeUPU']>, string>
>; // TrackingResult[].eventCodeUPU
export type Pin1354 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<T.TrackingResult>[number]>['eventPlaces']>, string>
>; // TrackingResult[].eventPlaces
export type Pin1355 = Assert<
  Eq<
    keyof NonNullable<NonNullable<NonNullable<T.TrackingResult>[number]>['eventCountryDescr']>,
    'descrUA' | 'descrRU' | 'descrEN'
  >
>; // TrackingResult[].eventCountryDescr keys
export type Pin1356 = Assert<
  Eq<Req<NonNullable<NonNullable<NonNullable<T.TrackingResult>[number]>['eventCountryDescr']>>, never>
>; // TrackingResult[].eventCountryDescr required
export type Pin1357 = Assert<
  Eq<
    NonNullable<NonNullable<NonNullable<NonNullable<T.TrackingResult>[number]>['eventCountryDescr']>['descrUA']>,
    string
  >
>; // TrackingResult[].eventCountryDescr.descrUA
export type Pin1358 = Assert<
  Eq<
    NonNullable<NonNullable<NonNullable<NonNullable<T.TrackingResult>[number]>['eventCountryDescr']>['descrRU']>,
    string
  >
>; // TrackingResult[].eventCountryDescr.descrRU
export type Pin1359 = Assert<
  Eq<
    NonNullable<NonNullable<NonNullable<NonNullable<T.TrackingResult>[number]>['eventCountryDescr']>['descrEN']>,
    string
  >
>; // TrackingResult[].eventCountryDescr.descrEN
export type Pin1360 = Assert<
  Eq<
    keyof NonNullable<NonNullable<NonNullable<T.TrackingResult>[number]>['eventCityDescr']>,
    'descrUA' | 'descrRU' | 'descrEN'
  >
>; // TrackingResult[].eventCityDescr keys
export type Pin1361 = Assert<
  Eq<Req<NonNullable<NonNullable<NonNullable<T.TrackingResult>[number]>['eventCityDescr']>>, never>
>; // TrackingResult[].eventCityDescr required
export type Pin1362 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<NonNullable<T.TrackingResult>[number]>['eventCityDescr']>['descrUA']>, string>
>; // TrackingResult[].eventCityDescr.descrUA
export type Pin1363 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<NonNullable<T.TrackingResult>[number]>['eventCityDescr']>['descrRU']>, string>
>; // TrackingResult[].eventCityDescr.descrRU
export type Pin1364 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<NonNullable<T.TrackingResult>[number]>['eventCityDescr']>['descrEN']>, string>
>; // TrackingResult[].eventCityDescr.descrEN
export type Pin1365 = Assert<
  Eq<
    keyof NonNullable<NonNullable<NonNullable<T.TrackingResult>[number]>['eventDescr']>,
    'descrUA' | 'descrRU' | 'descrEN'
  >
>; // TrackingResult[].eventDescr keys
export type Pin1366 = Assert<
  Eq<Req<NonNullable<NonNullable<NonNullable<T.TrackingResult>[number]>['eventDescr']>>, never>
>; // TrackingResult[].eventDescr required
export type Pin1367 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<NonNullable<T.TrackingResult>[number]>['eventDescr']>['descrUA']>, string>
>; // TrackingResult[].eventDescr.descrUA
export type Pin1368 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<NonNullable<T.TrackingResult>[number]>['eventDescr']>['descrRU']>, string>
>; // TrackingResult[].eventDescr.descrRU
export type Pin1369 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<NonNullable<T.TrackingResult>[number]>['eventDescr']>['descrEN']>, string>
>; // TrackingResult[].eventDescr.descrEN
export type Pin1370 = Assert<
  Eq<
    keyof NonNullable<NonNullable<NonNullable<T.TrackingResult>[number]>['eventDetailDescr']>,
    'descrUA' | 'descrRU' | 'descrEN'
  >
>; // TrackingResult[].eventDetailDescr keys
export type Pin1371 = Assert<
  Eq<Req<NonNullable<NonNullable<NonNullable<T.TrackingResult>[number]>['eventDetailDescr']>>, never>
>; // TrackingResult[].eventDetailDescr required
export type Pin1372 = Assert<
  Eq<
    NonNullable<NonNullable<NonNullable<NonNullable<T.TrackingResult>[number]>['eventDetailDescr']>['descrUA']>,
    string
  >
>; // TrackingResult[].eventDetailDescr.descrUA
export type Pin1373 = Assert<
  Eq<
    NonNullable<NonNullable<NonNullable<NonNullable<T.TrackingResult>[number]>['eventDetailDescr']>['descrRU']>,
    string
  >
>; // TrackingResult[].eventDetailDescr.descrRU
export type Pin1374 = Assert<
  Eq<
    NonNullable<NonNullable<NonNullable<NonNullable<T.TrackingResult>[number]>['eventDetailDescr']>['descrEN']>,
    string
  >
>; // TrackingResult[].eventDetailDescr.descrEN
export type Pin1375 = Assert<Eq<keyof T.TrackingByDatePathParams, 'searchDate'>>; // TrackingByDatePathParams keys
export type Pin1376 = Assert<Eq<Req<T.TrackingByDatePathParams>, 'searchDate'>>; // TrackingByDatePathParams required
export type Pin1377 = Assert<Eq<NonNullable<T.TrackingByDatePathParams['searchDate']>, string>>; // TrackingByDatePathParams.searchDate
export type Pin1378 = Assert<
  Eq<
    keyof NonNullable<NonNullable<T.TrackingByDateResult>[number]>,
    | 'parcelNumber'
    | 'barCode'
    | 'eventDateTime'
    | 'eventCode'
    | 'eventCodeUPU'
    | 'eventCountryDescr'
    | 'eventCityDescr'
    | 'eventDescr'
    | 'eventDetailDescr'
  >
>; // TrackingByDateResult[] keys
export type Pin1379 = Assert<Eq<Req<NonNullable<NonNullable<T.TrackingByDateResult>[number]>>, never>>; // TrackingByDateResult[] required
export type Pin1380 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<T.TrackingByDateResult>[number]>['parcelNumber']>, string>
>; // TrackingByDateResult[].parcelNumber
export type Pin1381 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<T.TrackingByDateResult>[number]>['barCode']>, string>
>; // TrackingByDateResult[].barCode
export type Pin1382 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<T.TrackingByDateResult>[number]>['eventDateTime']>, string>
>; // TrackingByDateResult[].eventDateTime
export type Pin1383 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<T.TrackingByDateResult>[number]>['eventCode']>, number>
>; // TrackingByDateResult[].eventCode
export type Pin1384 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<T.TrackingByDateResult>[number]>['eventCodeUPU']>, string>
>; // TrackingByDateResult[].eventCodeUPU
export type Pin1385 = Assert<
  Eq<
    keyof NonNullable<NonNullable<NonNullable<T.TrackingByDateResult>[number]>['eventCountryDescr']>,
    'descrUA' | 'descrRU' | 'descrEN'
  >
>; // TrackingByDateResult[].eventCountryDescr keys
export type Pin1386 = Assert<
  Eq<Req<NonNullable<NonNullable<NonNullable<T.TrackingByDateResult>[number]>['eventCountryDescr']>>, never>
>; // TrackingByDateResult[].eventCountryDescr required
export type Pin1387 = Assert<
  Eq<
    NonNullable<NonNullable<NonNullable<NonNullable<T.TrackingByDateResult>[number]>['eventCountryDescr']>['descrUA']>,
    string
  >
>; // TrackingByDateResult[].eventCountryDescr.descrUA
export type Pin1388 = Assert<
  Eq<
    NonNullable<NonNullable<NonNullable<NonNullable<T.TrackingByDateResult>[number]>['eventCountryDescr']>['descrRU']>,
    string
  >
>; // TrackingByDateResult[].eventCountryDescr.descrRU
export type Pin1389 = Assert<
  Eq<
    NonNullable<NonNullable<NonNullable<NonNullable<T.TrackingByDateResult>[number]>['eventCountryDescr']>['descrEN']>,
    string
  >
>; // TrackingByDateResult[].eventCountryDescr.descrEN
export type Pin1390 = Assert<
  Eq<
    keyof NonNullable<NonNullable<NonNullable<T.TrackingByDateResult>[number]>['eventCityDescr']>,
    'descrUA' | 'descrRU' | 'descrEN'
  >
>; // TrackingByDateResult[].eventCityDescr keys
export type Pin1391 = Assert<
  Eq<Req<NonNullable<NonNullable<NonNullable<T.TrackingByDateResult>[number]>['eventCityDescr']>>, never>
>; // TrackingByDateResult[].eventCityDescr required
export type Pin1392 = Assert<
  Eq<
    NonNullable<NonNullable<NonNullable<NonNullable<T.TrackingByDateResult>[number]>['eventCityDescr']>['descrUA']>,
    string
  >
>; // TrackingByDateResult[].eventCityDescr.descrUA
export type Pin1393 = Assert<
  Eq<
    NonNullable<NonNullable<NonNullable<NonNullable<T.TrackingByDateResult>[number]>['eventCityDescr']>['descrRU']>,
    string
  >
>; // TrackingByDateResult[].eventCityDescr.descrRU
export type Pin1394 = Assert<
  Eq<
    NonNullable<NonNullable<NonNullable<NonNullable<T.TrackingByDateResult>[number]>['eventCityDescr']>['descrEN']>,
    string
  >
>; // TrackingByDateResult[].eventCityDescr.descrEN
export type Pin1395 = Assert<
  Eq<
    keyof NonNullable<NonNullable<NonNullable<T.TrackingByDateResult>[number]>['eventDescr']>,
    'descrUA' | 'descrRU' | 'descrEN'
  >
>; // TrackingByDateResult[].eventDescr keys
export type Pin1396 = Assert<
  Eq<Req<NonNullable<NonNullable<NonNullable<T.TrackingByDateResult>[number]>['eventDescr']>>, never>
>; // TrackingByDateResult[].eventDescr required
export type Pin1397 = Assert<
  Eq<
    NonNullable<NonNullable<NonNullable<NonNullable<T.TrackingByDateResult>[number]>['eventDescr']>['descrUA']>,
    string
  >
>; // TrackingByDateResult[].eventDescr.descrUA
export type Pin1398 = Assert<
  Eq<
    NonNullable<NonNullable<NonNullable<NonNullable<T.TrackingByDateResult>[number]>['eventDescr']>['descrRU']>,
    string
  >
>; // TrackingByDateResult[].eventDescr.descrRU
export type Pin1399 = Assert<
  Eq<
    NonNullable<NonNullable<NonNullable<NonNullable<T.TrackingByDateResult>[number]>['eventDescr']>['descrEN']>,
    string
  >
>; // TrackingByDateResult[].eventDescr.descrEN
export type Pin1400 = Assert<
  Eq<
    keyof NonNullable<NonNullable<NonNullable<T.TrackingByDateResult>[number]>['eventDetailDescr']>,
    'descrUA' | 'descrRU' | 'descrEN'
  >
>; // TrackingByDateResult[].eventDetailDescr keys
export type Pin1401 = Assert<
  Eq<Req<NonNullable<NonNullable<NonNullable<T.TrackingByDateResult>[number]>['eventDetailDescr']>>, never>
>; // TrackingByDateResult[].eventDetailDescr required
export type Pin1402 = Assert<
  Eq<
    NonNullable<NonNullable<NonNullable<NonNullable<T.TrackingByDateResult>[number]>['eventDetailDescr']>['descrUA']>,
    string
  >
>; // TrackingByDateResult[].eventDetailDescr.descrUA
export type Pin1403 = Assert<
  Eq<
    NonNullable<NonNullable<NonNullable<NonNullable<T.TrackingByDateResult>[number]>['eventDetailDescr']>['descrRU']>,
    string
  >
>; // TrackingByDateResult[].eventDetailDescr.descrRU
export type Pin1404 = Assert<
  Eq<
    NonNullable<NonNullable<NonNullable<NonNullable<T.TrackingByDateResult>[number]>['eventDetailDescr']>['descrEN']>,
    string
  >
>; // TrackingByDateResult[].eventDetailDescr.descrEN
export type Pin1405 = Assert<Eq<keyof T.TrackingByPeriodPathParams, 'dateFrom' | 'dateTo'>>; // TrackingByPeriodPathParams keys
export type Pin1406 = Assert<Eq<Req<T.TrackingByPeriodPathParams>, 'dateFrom' | 'dateTo'>>; // TrackingByPeriodPathParams required
export type Pin1407 = Assert<Eq<NonNullable<T.TrackingByPeriodPathParams['dateFrom']>, string>>; // TrackingByPeriodPathParams.dateFrom
export type Pin1408 = Assert<Eq<NonNullable<T.TrackingByPeriodPathParams['dateTo']>, string>>; // TrackingByPeriodPathParams.dateTo
export type Pin1409 = Assert<
  Eq<
    keyof NonNullable<NonNullable<T.TrackingByPeriodResult>[number]>,
    | 'parcelNumber'
    | 'barCode'
    | 'eventDateTime'
    | 'eventCode'
    | 'eventCodeUPU'
    | 'eventCountryDescr'
    | 'eventCityDescr'
    | 'eventDescr'
    | 'eventDetailDescr'
  >
>; // TrackingByPeriodResult[] keys
export type Pin1410 = Assert<Eq<Req<NonNullable<NonNullable<T.TrackingByPeriodResult>[number]>>, never>>; // TrackingByPeriodResult[] required
export type Pin1411 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<T.TrackingByPeriodResult>[number]>['parcelNumber']>, string>
>; // TrackingByPeriodResult[].parcelNumber
export type Pin1412 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<T.TrackingByPeriodResult>[number]>['barCode']>, string>
>; // TrackingByPeriodResult[].barCode
export type Pin1413 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<T.TrackingByPeriodResult>[number]>['eventDateTime']>, string>
>; // TrackingByPeriodResult[].eventDateTime
export type Pin1414 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<T.TrackingByPeriodResult>[number]>['eventCode']>, number>
>; // TrackingByPeriodResult[].eventCode
export type Pin1415 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<T.TrackingByPeriodResult>[number]>['eventCodeUPU']>, string>
>; // TrackingByPeriodResult[].eventCodeUPU
export type Pin1416 = Assert<
  Eq<
    keyof NonNullable<NonNullable<NonNullable<T.TrackingByPeriodResult>[number]>['eventCountryDescr']>,
    'descrUA' | 'descrRU' | 'descrEN'
  >
>; // TrackingByPeriodResult[].eventCountryDescr keys
export type Pin1417 = Assert<
  Eq<Req<NonNullable<NonNullable<NonNullable<T.TrackingByPeriodResult>[number]>['eventCountryDescr']>>, never>
>; // TrackingByPeriodResult[].eventCountryDescr required
export type Pin1418 = Assert<
  Eq<
    NonNullable<
      NonNullable<NonNullable<NonNullable<T.TrackingByPeriodResult>[number]>['eventCountryDescr']>['descrUA']
    >,
    string
  >
>; // TrackingByPeriodResult[].eventCountryDescr.descrUA
export type Pin1419 = Assert<
  Eq<
    NonNullable<
      NonNullable<NonNullable<NonNullable<T.TrackingByPeriodResult>[number]>['eventCountryDescr']>['descrRU']
    >,
    string
  >
>; // TrackingByPeriodResult[].eventCountryDescr.descrRU
export type Pin1420 = Assert<
  Eq<
    NonNullable<
      NonNullable<NonNullable<NonNullable<T.TrackingByPeriodResult>[number]>['eventCountryDescr']>['descrEN']
    >,
    string
  >
>; // TrackingByPeriodResult[].eventCountryDescr.descrEN
export type Pin1421 = Assert<
  Eq<
    keyof NonNullable<NonNullable<NonNullable<T.TrackingByPeriodResult>[number]>['eventCityDescr']>,
    'descrUA' | 'descrRU' | 'descrEN'
  >
>; // TrackingByPeriodResult[].eventCityDescr keys
export type Pin1422 = Assert<
  Eq<Req<NonNullable<NonNullable<NonNullable<T.TrackingByPeriodResult>[number]>['eventCityDescr']>>, never>
>; // TrackingByPeriodResult[].eventCityDescr required
export type Pin1423 = Assert<
  Eq<
    NonNullable<NonNullable<NonNullable<NonNullable<T.TrackingByPeriodResult>[number]>['eventCityDescr']>['descrUA']>,
    string
  >
>; // TrackingByPeriodResult[].eventCityDescr.descrUA
export type Pin1424 = Assert<
  Eq<
    NonNullable<NonNullable<NonNullable<NonNullable<T.TrackingByPeriodResult>[number]>['eventCityDescr']>['descrRU']>,
    string
  >
>; // TrackingByPeriodResult[].eventCityDescr.descrRU
export type Pin1425 = Assert<
  Eq<
    NonNullable<NonNullable<NonNullable<NonNullable<T.TrackingByPeriodResult>[number]>['eventCityDescr']>['descrEN']>,
    string
  >
>; // TrackingByPeriodResult[].eventCityDescr.descrEN
export type Pin1426 = Assert<
  Eq<
    keyof NonNullable<NonNullable<NonNullable<T.TrackingByPeriodResult>[number]>['eventDescr']>,
    'descrUA' | 'descrRU' | 'descrEN'
  >
>; // TrackingByPeriodResult[].eventDescr keys
export type Pin1427 = Assert<
  Eq<Req<NonNullable<NonNullable<NonNullable<T.TrackingByPeriodResult>[number]>['eventDescr']>>, never>
>; // TrackingByPeriodResult[].eventDescr required
export type Pin1428 = Assert<
  Eq<
    NonNullable<NonNullable<NonNullable<NonNullable<T.TrackingByPeriodResult>[number]>['eventDescr']>['descrUA']>,
    string
  >
>; // TrackingByPeriodResult[].eventDescr.descrUA
export type Pin1429 = Assert<
  Eq<
    NonNullable<NonNullable<NonNullable<NonNullable<T.TrackingByPeriodResult>[number]>['eventDescr']>['descrRU']>,
    string
  >
>; // TrackingByPeriodResult[].eventDescr.descrRU
export type Pin1430 = Assert<
  Eq<
    NonNullable<NonNullable<NonNullable<NonNullable<T.TrackingByPeriodResult>[number]>['eventDescr']>['descrEN']>,
    string
  >
>; // TrackingByPeriodResult[].eventDescr.descrEN
export type Pin1431 = Assert<
  Eq<
    keyof NonNullable<NonNullable<NonNullable<T.TrackingByPeriodResult>[number]>['eventDetailDescr']>,
    'descrUA' | 'descrRU' | 'descrEN'
  >
>; // TrackingByPeriodResult[].eventDetailDescr keys
export type Pin1432 = Assert<
  Eq<Req<NonNullable<NonNullable<NonNullable<T.TrackingByPeriodResult>[number]>['eventDetailDescr']>>, never>
>; // TrackingByPeriodResult[].eventDetailDescr required
export type Pin1433 = Assert<
  Eq<
    NonNullable<NonNullable<NonNullable<NonNullable<T.TrackingByPeriodResult>[number]>['eventDetailDescr']>['descrUA']>,
    string
  >
>; // TrackingByPeriodResult[].eventDetailDescr.descrUA
export type Pin1434 = Assert<
  Eq<
    NonNullable<NonNullable<NonNullable<NonNullable<T.TrackingByPeriodResult>[number]>['eventDetailDescr']>['descrRU']>,
    string
  >
>; // TrackingByPeriodResult[].eventDetailDescr.descrRU
export type Pin1435 = Assert<
  Eq<
    NonNullable<NonNullable<NonNullable<NonNullable<T.TrackingByPeriodResult>[number]>['eventDetailDescr']>['descrEN']>,
    string
  >
>; // TrackingByPeriodResult[].eventDetailDescr.descrEN
export type Pin1436 = Assert<Eq<keyof T.TrackingDeliveredPathParams, 'dateFrom' | 'dateTo' | 'page'>>; // TrackingDeliveredPathParams keys
export type Pin1437 = Assert<Eq<Req<T.TrackingDeliveredPathParams>, 'dateFrom' | 'dateTo' | 'page'>>; // TrackingDeliveredPathParams required
export type Pin1438 = Assert<Eq<NonNullable<T.TrackingDeliveredPathParams['dateFrom']>, string>>; // TrackingDeliveredPathParams.dateFrom
export type Pin1439 = Assert<Eq<NonNullable<T.TrackingDeliveredPathParams['dateTo']>, string>>; // TrackingDeliveredPathParams.dateTo
export type Pin1440 = Assert<Eq<NonNullable<T.TrackingDeliveredPathParams['page']>, number>>; // TrackingDeliveredPathParams.page
export type Pin1441 = Assert<
  Eq<
    keyof NonNullable<NonNullable<T.TrackingDeliveredResult>[number]>,
    'parcelNumber' | 'barCode' | 'eventDateTime' | 'eventCountryDescr' | 'eventCityDescr'
  >
>; // TrackingDeliveredResult[] keys
export type Pin1442 = Assert<Eq<Req<NonNullable<NonNullable<T.TrackingDeliveredResult>[number]>>, never>>; // TrackingDeliveredResult[] required
export type Pin1443 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<T.TrackingDeliveredResult>[number]>['parcelNumber']>, string>
>; // TrackingDeliveredResult[].parcelNumber
export type Pin1444 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<T.TrackingDeliveredResult>[number]>['barCode']>, string>
>; // TrackingDeliveredResult[].barCode
export type Pin1445 = Assert<
  Eq<NonNullable<NonNullable<NonNullable<T.TrackingDeliveredResult>[number]>['eventDateTime']>, string>
>; // TrackingDeliveredResult[].eventDateTime
export type Pin1446 = Assert<
  Eq<
    keyof NonNullable<NonNullable<NonNullable<T.TrackingDeliveredResult>[number]>['eventCountryDescr']>,
    'descrUA' | 'descrRU' | 'descrEN'
  >
>; // TrackingDeliveredResult[].eventCountryDescr keys
export type Pin1447 = Assert<
  Eq<Req<NonNullable<NonNullable<NonNullable<T.TrackingDeliveredResult>[number]>['eventCountryDescr']>>, never>
>; // TrackingDeliveredResult[].eventCountryDescr required
export type Pin1448 = Assert<
  Eq<
    NonNullable<
      NonNullable<NonNullable<NonNullable<T.TrackingDeliveredResult>[number]>['eventCountryDescr']>['descrUA']
    >,
    string
  >
>; // TrackingDeliveredResult[].eventCountryDescr.descrUA
export type Pin1449 = Assert<
  Eq<
    NonNullable<
      NonNullable<NonNullable<NonNullable<T.TrackingDeliveredResult>[number]>['eventCountryDescr']>['descrRU']
    >,
    string
  >
>; // TrackingDeliveredResult[].eventCountryDescr.descrRU
export type Pin1450 = Assert<
  Eq<
    NonNullable<
      NonNullable<NonNullable<NonNullable<T.TrackingDeliveredResult>[number]>['eventCountryDescr']>['descrEN']
    >,
    string
  >
>; // TrackingDeliveredResult[].eventCountryDescr.descrEN
export type Pin1451 = Assert<
  Eq<
    keyof NonNullable<NonNullable<NonNullable<T.TrackingDeliveredResult>[number]>['eventCityDescr']>,
    'descrUA' | 'descrRU' | 'descrEN'
  >
>; // TrackingDeliveredResult[].eventCityDescr keys
export type Pin1452 = Assert<
  Eq<Req<NonNullable<NonNullable<NonNullable<T.TrackingDeliveredResult>[number]>['eventCityDescr']>>, never>
>; // TrackingDeliveredResult[].eventCityDescr required
export type Pin1453 = Assert<
  Eq<
    NonNullable<NonNullable<NonNullable<NonNullable<T.TrackingDeliveredResult>[number]>['eventCityDescr']>['descrUA']>,
    string
  >
>; // TrackingDeliveredResult[].eventCityDescr.descrUA
export type Pin1454 = Assert<
  Eq<
    NonNullable<NonNullable<NonNullable<NonNullable<T.TrackingDeliveredResult>[number]>['eventCityDescr']>['descrRU']>,
    string
  >
>; // TrackingDeliveredResult[].eventCityDescr.descrRU
export type Pin1455 = Assert<
  Eq<
    NonNullable<NonNullable<NonNullable<NonNullable<T.TrackingDeliveredResult>[number]>['eventCityDescr']>['descrEN']>,
    string
  >
>; // TrackingDeliveredResult[].eventCityDescr.descrEN
