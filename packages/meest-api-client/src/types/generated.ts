// AUTO-GENERATED FILE. DO NOT EDIT DIRECTLY.
// Run `node scripts/generate-types.js` after updating docs/openapi.json.
import type { MeestResponse } from './base';

// authentication :: POST /auth
// Аутентифікація користувача
export type AuthRequestBody = {
  username: string;
  password: string;
};
/** Result payload */
export type AuthResult = {
  token?: string;
  refresh_token?: string;
  /** Час життя токена, у секундах */
  expiresIn?: number;
};
export type AuthResponse = MeestResponse<AuthResult>;
export interface AuthRequest {
  body: AuthRequestBody;
}

// authentication :: POST /refreshToken
// Оновлення токена
export type RefreshTokenRequestBody = {
  refreshToken: string;
};
/** Result payload */
export type RefreshTokenResult = {
  token?: string;
  refresh_token?: string;
  /** Час життя токена, у секундах */
  expiresIn?: number;
};
export type RefreshTokenResponse = MeestResponse<RefreshTokenResult>;
export interface RefreshTokenRequest {
  body: RefreshTokenRequestBody;
}

// other :: GET /banners
// Банери
/** Result payload */
export type BannersResult = Array<{
    url?: {
      /** Посилання для української мови */
      UA?: string;
      /** Посилання для англійської мови */
      EN?: string;
      /** Посилання для російської мови */
      RU?: string;
    };
    file?: {
      /** Шлях до файлу для української мови */
      UA?: string;
      /** Шлях до файлу для англійської мови */
      EN?: string;
      /** Шлях до файлу для російської мови */
      RU?: string;
    };
  }>;
export type BannersResponse = MeestResponse<BannersResult>;
export interface BannersRequest {
  // no parameters
}

// other :: GET /CheckPhoneOnParcel/{barCode}/{phoneCheck}
// Перевірка номеру за посилкою
export interface CheckPhoneOnParcelPathParams {
    /** В параметр 'barCode' можна передавати на вибір 1 параметр: Унікальний ідентифікатор відправлення (parcelID), Штрих-код відправлення згенерований системою (barCode) або Номер відправлення (parcelNumber). */
    barCode: string;
    /** Номер телефону для перевірки */
    phoneCheck: string;
}
export type CheckPhoneOnParcelResponse = MeestResponse<void>;
export interface CheckPhoneOnParcelRequest {
  path: CheckPhoneOnParcelPathParams;
}

// other :: GET /contractClientInfo/{contractID}
// інформація по договору контрагента
export interface ContractClientInfoPathParams {
    /** Унікальний ідентифікатор договору контрагента */
    contractID: string;
}
export type ContractClientInfoResponse = MeestResponse<void>;
export interface ContractClientInfoRequest {
  path: ContractClientInfoPathParams;
}

// other :: POST /contract_validation_check
// Метод валідації Contract id до Agent id
export type ContractValidationCheckRequestBody = {
  /** унікальний ідентифікатор об'єкта з довідника “Договори взаєморозрахунків” */
  ContractID: string;
  /** унікальний ідентифікатор об'єкта з довідника “Контрагенти” */
  AgentID?: string;
};
/** Result payload */
export type ContractValidationCheckResult = {
  /**  */
  status?: string;
  /**  */
  text?: string;
};
export type ContractValidationCheckResponse = MeestResponse<ContractValidationCheckResult>;
export interface ContractValidationCheckRequest {
  body?: ContractValidationCheckRequestBody;
}

// other :: POST /parcelReturn_new
// Повернення
export type ParcelReturnNewRequestBody = {
  /** унікальний ідентифікатор посилки */
  parcelID?: string;
  /** унікальний ідентифікатор причини */
  reasonID?: string;
};
export type ParcelReturnNewResponse = MeestResponse<void>;
export interface ParcelReturnNewRequest {
  body?: ParcelReturnNewRequestBody;
}

// other :: GET /parcelReturnReasons
// Причини статусів
/** Result payload */
export type ParcelReturnReasonsResult = Array<{
    /**  */
    name?: string;
    /**  */
    nameUA?: string;
    /**  */
    nameRU?: string;
    /**  */
    nameEN?: string;
    /**  */
    uuid?: string;
  }>;
export type ParcelReturnReasonsResponse = MeestResponse<ParcelReturnReasonsResult>;
export interface ParcelReturnReasonsRequest {
  // no parameters
}

// parcels :: POST /calculate
// Розрахунок вартості послуг та дати доставки
export type CalculateRequestBody = {
  /** Дата відправки. Якщо параметр не передано/порожній, то для розрахунків використовується поточна дата. Формат: dd.MM.yyyy */
  sendingDate?: string;
  /** Унікальний ідентифікатор клієнта. Присвоюється після внесення контрагента в систему */
  contractID?: string;
  /** Післяплата/цінність зворотнього відправлення. Тип: float(8,2) */
  COD?: number;
  /** Промокод */
  promocode?: string;
  sender?: {
    /** Унікальний ідентифікатор підрозділу відправника. Отримується функцією «branchSearch». Обов'язковий, якщо service == Branch */
    branchID: string;
    /** Унікальний ідентифікатор міста. Отримується функцією «citySearch». Обов'язковий, якщо service == Door */
    cityID: string;
    /** Номер поверху відправника */
    floor?: number;
    /** Вид доставки. Значення: [Door, Branch] */
    service: string;
  };
  receiver?: {
    /** Унікальний ідентифікатор підрозділу отримувача. Отримується функцією «branchSearch». Обов'язковий для експортних посилок. */
    countryID?: string;
    /** Унікальний ідентифікатор підрозділу отримувача. Отримується функцією «branchSearch». Обов'язковий, якщо service == Branch */
    branchID: string;
    /** Унікальний ідентифікатор міста. Отримуєтсья функцією «citySearch». Обов'язковий, якщо service == Door */
    cityID: string;
    /** Номер поверху отримувача */
    floor?: number;
    /** Вид доставки. Значення: [Door, Branch] */
    service: string;
  };
  specConditionsItems?: Array<{
      /** Унікальний ідентифікатор умови доставки. Отримується функцію «specConditions» */
      conditionID?: string;
    }>;
  placesItems?: Array<{
      /** Кількість місць */
      quantity: number;
      /** Вага, кг. Тип: float(8,3) */
      weight: number;
      /** Об'єм, м³. Тип: float(7,3) */
      volume?: number;
      /** Оголошена цінність відправлення. Тип: float(9,2) */
      insurance?: number;
      /** Довжина, см */
      length?: number;
      /** Ширина, см */
      width?: number;
      /** Висота, см */
      height?: number;
      /** Радіус коліс */
      wheels?: string;
    }>;
};
/** Result payload */
export type CalculateResult = Array<{
    /** Обчислена системою вартість послуг */
    costServices?: string;
    /** Прогнозована дата доставки */
    estimatedDeliveryDate?: string;
    possibleDeliveryDates?: Array<{
        /** Альтернативна дата доставки. Cистема розраховує 14 дат. */
        deliveryDate?: string;
      }>;
  }>;
export type CalculateResponse = MeestResponse<CalculateResult>;
export interface CalculateRequest {
  body?: CalculateRequestBody;
}

// parcels :: GET /getParcel/{parcelID}/{searchMode}/{returnMode}
// Інформація про відправлення
export interface GetParcelPathParams {
    /** Параметр пошуку, приймає значення параметрів (parcelID, barCode, parcelNumber) */
    parcelID: string;
    /** параметр фільтрації пошуку, приймає назву параметрів (parcelID, barCode, parcelNumber) */
    searchMode: string;
    /** objectData printCN23 printCP71 */
    returnMode: string;
}
/** Result payload */
export type GetParcelResult = {
  /** Номер відправлення */
  parcelNumber?: string;
  /** ЄДРПОУ платника за послугу */
  subAgent?: string;
  /** Назва агента */
  agent?: string;
  /** Примітка, коментар */
  notation?: string;
  /** Тип оплати. Значення: [cash - готівковий, noncash - безготівковий] */
  payType?: string;
  /** Хто оплачує відправлення. «false» - Відправник, «true» - Одержувач */
  receiverPay?: string;
  /** Післяплата/цінність зворотного відправлення. Тип: float(8,2) */
  COD?: string;
  /** Загальна вага посилки. float(8,3) */
  weight?: string;
  /** ID міжнародного підрозділу */
  pudoID?: string;
  /** Тип міжнародного підрозділу */
  pudoPointType?: string;
  /** Бажана дата доставки. */
  expectedDeliveryDate?: string;
  sender?: {
    /** Відправник */
    name?: string;
    /** Телефон відправника */
    phone?: string;
    /** Поштовий індекс відправника */
    zipCode?: string;
    /** Унікальний ідентифікатор підрозділу відправника. */
    branchID?: string;
    /** Унікальний ідентифікатор адреси відправника. */
    addressID?: string;
    /** Номер будівлі відправника. */
    building?: string;
    /** Номер квартири відправника */
    flat?: string;
    /** Номер поверху відправника */
    floor?: string;
    /** Вид сервісу. Значення: [Door, Branch] */
    service?: string;
  };
  receiver?: {
    /** Отримувач */
    name?: string;
    /** Телефон отримувача */
    phone?: string;
    /** Поштовий індекс отримувача */
    zipCode?: string;
    /** Унікальний ідентифікатор підрозділу отримувача. */
    branchID?: string;
    /** Унікальний ідентифікатор адреси отримувача. */
    addressID?: string;
    /** Номер будівлі отримувача. */
    building?: string;
    /** Номер квартири отримувача */
    flat?: string;
    /** Номер поверху отримувача */
    floor?: string;
    /** Вид доставки. Значення: [Door, Branch] */
    service?: string;
  };
  placesItems?: Array<{
      /** Кількість місць */
      quantity?: string;
      /** Вага, кг. Тип: float(8,3) */
      weight?: string;
      /** Об’єм, м³. Тип: float(7,3) */
      volume?: string;
      /** Оголошена цінність відправлення. Тип: float(9,2) */
      insurance?: string;
      /** Унікальний ідентифікатор упаковки. Отримується функцією «packTypes» */
      packID?: string;
      /** Довжина, см */
      length?: string;
      /** Ширина, см */
      width?: string;
      /** Висота, см */
      height?: string;
      /** Радіус коліс */
      wheels?: string;
      /** Розмір комірки */
      size?: string;
    }>;
  specConditionsItems?: Array<{
      /** Унікальний ідентифікатор умови доставки. Отримується функцією «specConditions» */
      conditionID?: string;
    }>;
  contentsItems?: Array<{
      /** Назва вмісту */
      contentName?: string;
      /** Кількість вмісту, одиниць */
      quantity?: string;
      /** Вага вмісту, кг. Тип: float(8,3) */
      weight?: string;
      /** Вартість вмісту. Тип: float(9,2) */
      value?: string;
      /** Митний код */
      customsCode?: string;
      /** Країна походження */
      country?: string;
    }>;
  codPaymentItems?: Array<{
      /** ЕДРПОУ отримувача коштів. Має бути зареєстрований с системі перевізника */
      agentId?: string;
      /** Сума коштів від загальної суми COD */
      cod?: string;
    }>;
  goods?: Array<{
      /** артикул */
      article?: string;
      /** назва */
      name?: string;
      /** серійний номер */
      serialNumber?: string;
      /** серійний номер */
      weight?: string;
      /** кількість */
      quantity?: string;
      /** ціна */
      price?: string;
      /** довжина */
      length?: string;
      /** ширина */
      width?: string;
      /** висота */
      height?: string;
    }>;
  deliveryOptions?: {
    /** Мінімальна сума товарів */
    minAmountGoods?: string;
    /** Вартість за доставку при недостатній сумі товарів */
    amountDeliveryShortageGoods?: string;
  };
  cardForCOD?: {
    /** номер картки */
    number?: string;
    /** ПІБ отримувача */
    ownername?: string;
    /** Телефон отримувача */
    ownermobile?: string;
  };
  /** Якщо true, то напрямок руху посилки - повернення. */
  return?: boolean;
};
export type GetParcelResponse = MeestResponse<GetParcelResult>;
export interface GetParcelRequest {
  path: GetParcelPathParams;
}

// parcels :: POST /LockParcel
// Блокує доставку посилки
export type LockParcelRequestBody = {
  /** ID договора з клієнтом в базі Росан/Міст Експрес */
  ClientUID?: string;
  /** UID посилки */
  ParcelUID?: string;
  /** Номер посилки */
  ClientsShipmentRef: string;
  /** Назва системи звідки надіслано запит */
  AppName?: string;
  /** Примітка */
  Notation?: string;
};
/** Result payload */
export type LockParcelResult = unknown;
export type LockParcelResponse = MeestResponse<LockParcelResult>;
export interface LockParcelRequest {
  body?: LockParcelRequestBody;
}

// parcels :: GET /orderDateInfo/{streetID}
// список дат виклику кур'єра
export interface OrderDateInfoPathParams {
    /** Унікальний ідентифікатор вулиці */
    streetID: string;
}
/** Result payload */
export type OrderDateInfoResult = Array<{
    /** Дата */
    date?: string;
    /** Доступність */
    isAvailable?: boolean;
  }>;
export type OrderDateInfoResponse = MeestResponse<OrderDateInfoResult>;
export interface OrderDateInfoRequest {
  path: OrderDateInfoPathParams;
}

// parcels :: POST /parcel
// Створення відправлення
export type ParcelRequestBody = {
  /** Номер відправлення */
  parcelNumber?: string;
  /** ЄДРПОУ платника за послугу */
  subAgent?: string;
  /** Примітка, коментар */
  notation?: string;
  /** Унікальний ідентифікатор договору(контракту), який Ви отримали від менеджера з супроводу. Присвоюється після внесення контрагента в систему */
  contractID?: string;
  /** Тип оплати за послугу доставки. Значення: [cash - готівковий, noncash - безготівковий] */
  payType: string;
  /** Хто оплачує відправлення. «false» - Відправник, «true» - Одержувач */
  receiverPay: boolean;
  /** Післяплата/цінність зворотнього відправлення. Тип: float(8,2) */
  COD?: number;
  /** Загальна вага посилки. Обов'язковий, якщо є блок [placesItems]. float(8,3) */
  weight?: number;
  /** Дата відправки. Якщо параметр не передано/порожній, то для розрахунків використовується поточна дата. Формат: dd.MM.yyyy */
  sendingDate?: string;
  /** Якщо true, то у відповідь виводить додаткову інформацію про відправлення, включно з parcelNumber */
  info4Sticker?: boolean;
  /** ID міжнародного підрозділу */
  pudoID?: string;
  /** Тип міжнародного підрозділу */
  pudoPointType?: string;
  /** Назва міжнародного підрозділу */
  pudoDescription?: string;
  /** Клієнт фіз.особа(УидСкл21С) */
  AgentID?: string;
  /** Транзитный Код */
  orderNumber?: string;
  /** ШтрихКод */
  barcode?: string;
  /** ШтрихКод_myMeest */
  barcode_myMeest?: string;
  /** BAG_ID_IN */
  bagNumber?: string;
  /** AWB */
  awbNumber?: string;
  /** Платить за доставку: 1 – отримувач, 2 – відправник (Це спеціальний параметр. Якщо Ви не знаєте що це за параметр, то просто ігноруйте його) */
  delivery_payment_payer?: string;
  /** Промокод */
  promocode?: string;
  expectedPickUpDate?: {
    /** Бажана дата забору. Формат: dd.MM.yyyy */
    date?: string;
    /** Початок бажаного часового діапазону забору. Формат: hh:mm */
    timeFrom?: string;
    /** Кінець бажаного часового діапазону забору. Формат: hh:mm */
    timeTo?: string;
  };
  expectedDeliveryDate?: {
    /** Бажана дата доcтавки. Якщо service == Branch, то не враховується. Для попередньої оцінки доступності дати скористайтесь функцією calculate - вона підтвердить бажану дату доставки або запропонує 14 альтернативних дат. Формат: dd.MM.yyyy. */
    date?: string;
    /** Початок бажаного часового діапазону доставки. Якщо service == Branch, то не враховується. Формат: hh:mm */
    timeFrom?: string;
    /** Кінець бажаного часового діапазону доставки. Якщо service == Branch, то не враховується. Формат: hh:mm */
    timeTo?: string;
  };
  sender?: {
    /** Відправник */
    name: string;
    /** Телефон відправника */
    phone: string;
    /** Поштовий індекс відправника */
    zipCode?: string;
    /** Унікальний ідентифікатор підрозділу відправника. Отримується функцією «branchSearch». Обов'язковий, якщо service == Branch */
    branchID: string;
    /** Унікальний ідентифікатор вулиці відправника */
    addressID: string;
    /** Номер будівлі відправника. Обов'язковий, якщо service == Door */
    building: string;
    /** Номер квартири відправника */
    flat?: string;
    /** Номер поверху відправника */
    floor?: number;
    /** корпус */
    corps?: string;
    /** Вид сервісу. Значення: [Door, Branch] */
    service: string;
    /** Комментарий по отправителю */
    notation?: string;
    /** Країна Відправник */
    countryId?: string;
    /** Назва міста */
    cityDescr?: string;
  };
  receiver?: {
    /** Отримувач */
    name: string;
    /** Телефон отримувача */
    phone: string;
    /** Поштовий індекс отримувача */
    zipCode?: string;
    /** Унікальний ідентифікатор підрозділу отримувача. Отримується функцією «branchSearch». Обов'язковий, якщо service == Branch */
    branchID: string;
    /** Унікальний ідентифікатор вулиці отримувача */
    addressID: string;
    /** Номер будівлі отримувача. Обов'язковий, якщо service == Door */
    building: string;
    /** Номер квартири отримувача */
    flat?: string;
    /** Номер поверху отримувача */
    floor?: number;
    /** Корпус */
    corps?: string;
    /** Вид доставки. Значення: [Door, Branch] */
    service: string;
    /** Країна отримувач */
    countryId?: string;
    /** Область отримувач */
    regionDescr?: string;
    /** Район отримувач */
    districtDescr?: string;
    /** Назва міста */
    cityDescr?: string;
    /** Адреса */
    addressDescr?: string;
    /** Комментарий по получателю */
    notation?: string;
    /** ПодразделениеДоставкиНП ПВХк */
    branchIdExternal?: string;
  };
  placesItems?: Array<{
      /** Кількість місць */
      quantity: number;
      /** Вага одного окремого місця, кг. Тип: float(8,3) */
      placeWeight: number;
      /** Вага, кг. Має дорівнювати сумі всіх placeWeight. Тип: float(8,3) */
      weight?: number;
      /** Об'єм одного окремого місця, м³. Тип: float(7,3) */
      placeVolume: number;
      /** Об'єм, м³. Має дорівнювати сумі всіх placeVolume. Тип: float(7,3) */
      volume?: number;
      /** Оголошена цінність відправлення. Тип: float(9,2) */
      insurance?: number;
      /** Довжина, см */
      length?: number;
      /** Ширина, см */
      width?: number;
      /** Висота, см */
      height?: number;
      /** Якщо true, то відправлення поїде на піддоні. Мінімальний розмір піддону 1.2 х 0.8 м. */
      pallet?: boolean;
      /** Радіус коліс. Доступні значення для легкових: R13-R23. Доступні значення для вантажних(якщо вага колеса більше 18 кг): RV1 (R15-R17,5), RV2 (R18-R19,5), RV3 (R20), RV4 (R21-R22,5) */
      wheels?: string;
      /** Розмір комірки */
      size?: string;
      /** Унікальний ідентифікатор формату */
      formatID?: string;
    }>;
  specConditionsItems?: Array<{
      /** Унікальний ідентифікатор умови доставки. Отримується функцією «specConditions» */
      conditionID?: string;
    }>;
  contentsItems?: Array<{
      /** Назва вмісту */
      contentName: string;
      /** Кількість вмісту, одиниць */
      quantity: number;
      /** Вага вмісту, кг. Тип: float(8,3) */
      weight: number;
      /** Вартість вмісту. Тип: float(9,2) */
      value: number;
      /** Митний код */
      customsCode?: string;
      /** Країна походження */
      country?: string;
      /** Розмір */
      size?: string;
      /** ШтрихКод */
      ean13?: string;
      /** пол */
      gender?: string;
      /** Сумма в валюты криъни отримувача */
      valueReceiverCurrency?: string;
    }>;
  codPaymentsItems?: Array<{
      /** ЕДРПОУ отримувача коштів. Має бути зареєстрований с системі перевізника */
      agentId: string;
      /** Сума коштів від загальної суми COD */
      cod: number;
    }>;
  goods?: Array<{
      /** артикул */
      article: string;
      /** назва */
      name: string;
      /** серійний номер */
      serialNumber?: string;
      /** вага */
      weight: number;
      /** кількість */
      quantity: number;
      /** ціна */
      price: number;
      /** довжина */
      length?: number;
      /** ширина */
      width?: number;
      /** висота */
      height?: number;
    }>;
  deliveryOptions?: {
    /** Мінімальна сума товарів */
    minAmountGoods?: number;
    /** Вартість за доставку при недостатній сумі товарів */
    amountDeliveryShortageGoods?: number;
  };
  cardForCOD?: {
    /** номер картки */
    number: string;
    /** ПІБ отримувача */
    ownername?: string;
    /** Телефон отримувача */
    ownermobile: string;
  };
  branchForCOD?: {
    /** ID відділення для отримання переказу */
    branchID: string;
    receiver?: {
      /** Ім'я одержувача переказу (відправник посилки) */
      firstname: string;
      /** По батькові одержувача переказу (відправник посилки) */
      middlename: string;
      /** Прізвище одержувача переказу (відправник посилки) */
      lastname: string;
    };
    payer?: {
      /** Ім'я платника переказу (одержувача посилки) */
      firstname: string;
      /** По батькові платника переказу (одержувача посилки) */
      middlename: string;
      /** Прізвище платника переказу (одержувача посилки) */
      lastname: string;
      /** телефон платника */
      phone?: string;
    };
  };
};
/** Result payload */
export type ParcelResult = {
  /** Унікальний іденифікатор відправлення */
  parcelID?: string;
  /** Унікальний ідентифікатор агента */
  AgentID?: string;
  /** Штрих-код відправлення, згенерований системою */
  barCode?: string;
  /** Обчислена системою вартість послуг */
  costServices?: number;
  /** Прогнозована дата доставки. */
  estimatedDeliveryDate?: string;
  /**  */
  parcelNumber?: string;
  /**  */
  branchName?: string;
  /**  */
  branchCode?: string;
  /**  */
  branchAddressDetails?: string;
  /**  */
  deliveryType?: string;
  /**  */
  formatType?: string;
  /**  */
  totalPlaces?: number;
  /**  */
  hikingServiceRoute?: string;
  /**  */
  mainServiceRoute?: string;
  /**  */
  receiverName?: string;
  /**  */
  receiverPhone?: string;
  /**  */
  receiverCity?: string;
  /**  */
  receiverDistrict?: string;
  /**  */
  receiverRegion?: string;
  /**  */
  receiverAddress?: string;
  /**  */
  receiverBuilding?: string;
  /**  */
  receiverFlat?: string;
  /**  */
  COD?: number;
  /**  */
  notation?: string;
  /**  */
  value?: number;
};
export type ParcelResponse = MeestResponse<ParcelResult>;
export interface ParcelRequest {
  body?: ParcelRequestBody;
}

// parcels :: PUT /parcel/{parcelID}
// Редагування відправлення
export type Parcel2RequestBody = {
  /** Номер відправлення */
  parcelNumber?: string;
  /** ЄДРПОУ платника за послугу */
  subAgent?: string;
  /** Примітка, коментар */
  notation?: string;
  /** Унікальний ідентифікатор клієнта. Присвоюється після внесення контрагента в систему */
  contractID?: string;
  /** Тип оплати за послугу доставки. Значення: [cash - готівковий, noncash - безготівковий] */
  payType: string;
  /** Хто оплачує відправлення. «false» - Відправник, «true» - Одержувач */
  receiverPay: boolean;
  /** Післяплата/цінність зворотнього відправлення. Тип: float(8,2) */
  COD?: number;
  /** Загальна вага посилки. Обов'язковий, якщо є блок [placesItems]. float(8,3) */
  weight?: number;
  /** Дата відправки. Якщо параметр не передано/порожній, то для розрахунків використовується поточна дата. Формат: dd.MM.yyyy */
  sendingDate?: string;
  /**  */
  info4Sticker?: boolean;
  /** ID міжнародного підрозділу */
  pudoID?: string;
  /** Тип міжнародного підрозділу */
  pudoPointType?: string;
  /** Назва міжнародного підрозділу */
  pudoDescription?: string;
  /** Клієнт фіз.особа(УидСкл21С) */
  AgentID?: string;
  /** Транзитный Код */
  orderNumber?: string;
  /** ШтрихКод */
  barcode?: string;
  /** ШтрихКод_myMeest */
  barcode_myMeest?: string;
  /** BAG_ID_IN */
  bagNumber?: string;
  /** AWB */
  awbNumber?: string;
  /** платить за доставку */
  delivery_payment_payer?: string;
  expectedPickUpDate?: {
    /** Бажана дата забору. Формат: dd.MM.yyyy */
    date?: string;
    /** Початок бажаного часового діапазону забору. Формат: hh:mm */
    timeFrom?: string;
    /** Кінець бажаного часового діапазону забору. Формат: hh:mm */
    timeTo?: string;
  };
  expectedDeliveryDate?: {
    /** Бажана дата доcтавки. Якщо service == Branch, то не враховується. Для попередньої оцінки доступності дати скористайтесь функцією calculate - вона підтвердить бажану дату доставки або запропонує 14 альтернативних дат. Формат: dd.MM.yyyy. */
    date?: string;
    /** Початок бажаного часового діапазону доставки. Якщо service == Branch, то не враховується. Формат: hh:mm */
    timeFrom?: string;
    /** Кінець бажаного часового діапазону доставки. Якщо service == Branch, то не враховується. Формат: hh:mm */
    timeTo?: string;
  };
  sender?: {
    /** Відправник */
    name: string;
    /** Телефон відправника */
    phone: string;
    /** Поштовий індекс відправника */
    zipCode?: string;
    /** Унікальний ідентифікатор підрозділу відправника. Отримується функцією «branchSearch». Обов'язковий, якщо service == Branch */
    branchID: string;
    /** Унікальний ідентифікатор вулиці відправника. Отримується функцією «addressSearch». Обов'язковий, якщо service == Door */
    addressID: string;
    /** Номер будівлі відправника. Обов'язковий, якщо service == Door */
    building: string;
    /** Номер квартири відправника */
    flat?: string;
    /** Номер поверху відправника */
    floor?: number;
    /** корпус */
    corps?: string;
    /** Вид сервісу. Значення: [Door, Branch] */
    service: string;
    /** Комментарий по отправителю */
    notation?: string;
    /** Країна Відправник */
    countryId?: string;
    /** Назва міста */
    cityDescr?: string;
  };
  receiver?: {
    /** Отримувач */
    name: string;
    /** Телефон отримувача */
    phone: string;
    /** Поштовий індекс отримувача */
    zipCode: string;
    /** Унікальний ідентифікатор підрозділу отримувача. Отримується функцією «branchSearch». Обов'язковий, якщо service == Branch */
    branchID: string;
    /** Унікальний ідентифікатор вулиці отримувача. Отримується функцією «addressSearch». Обов'язковий, якщо service == Door */
    addressID: string;
    /** Номер будівлі отримувача. Обов'язковий, якщо service == Door */
    building: string;
    /** Номер квартири отримувача */
    flat?: string;
    /** Номер поверху отримувача */
    floor?: number;
    /** Корпус */
    corps?: string;
    /** Вид доставки. Значення: [Door, Branch] */
    service: string;
    /** Країна отримувач */
    countryId?: string;
    /** Область отримувач */
    regionDescr?: string;
    /** Район отримувач */
    districtDescr?: string;
    /** Назва міста */
    cityDescr?: string;
    /** Адреса */
    addressDescr?: string;
    /** Комментарий по получателю */
    notation?: string;
    /** ПодразделениеДоставкиНП ПВХк */
    branchIdExternal?: string;
  };
  placesItems?: Array<{
      /** Кількість місць */
      quantity: number;
      /** Вага, кг. Тип: float(8,3) */
      weight: number;
      /** Об'єм, м³. Тип: float(7,3) */
      volume?: number;
      /** Оголошена цінність відправлення. Тип: float(9,2) */
      insurance?: number;
      /** Унікальний ідентифікатор упаковки. Отримується функцією «packTypes» */
      packID?: string;
      /** Довжина, см */
      length?: number;
      /** Ширина, см */
      width?: number;
      /** Висота, см */
      height?: number;
      /** На піддоні */
      pallet?: boolean;
      /** Радіус коліс */
      wheels?: string;
      /** Розмір комірки */
      size?: string;
      /** Унікальний ідентифікатор формата */
      formatID?: string;
    }>;
  specConditionsItems?: Array<{
      /** Унікальний ідентифікатор умови доставки. Отримується функцією «specConditions» */
      conditionID?: string;
    }>;
  contentsItems?: Array<{
      /** Назва вмісту */
      contentName: string;
      /** Кількість вмісту, одиниць */
      quantity: number;
      /** Вага вмісту, кг. Тип: float(8,3) */
      weight: number;
      /** Вартість вмісту. Тип: float(9,2) */
      value: number;
      /** Митний код */
      customsCode?: string;
      /** Країна походження */
      country?: string;
      /** Розмір */
      size?: string;
      /** ШтрихКод */
      ean13?: string;
      /** пол */
      gender?: string;
      /** Сумма в валюты криъни отримувача */
      valueReceiverCurrency?: string;
    }>;
  codPaymentsItems?: Array<{
      /** ЕДРПОУ отримувача коштів. Має бути зареєстрований с системі перевізника */
      agentId: string;
      /** Сума коштів від загальної суми COD */
      cod: number;
    }>;
  goods?: Array<{
      /** артикул */
      article: string;
      /** назва */
      name: string;
      /** серійний номер */
      serialNumber?: string;
      /** вага */
      weight: number;
      /** кількість */
      quantity: number;
      /** ціна */
      price: number;
      /** довжина */
      length?: number;
      /** ширина */
      width?: number;
      /** висота */
      height?: number;
    }>;
  deliveryOptions?: {
    /** Мінімальна сума товарів */
    minAmountGoods?: number;
    /** Вартість за доставку при недостатній сумі товарів */
    amountDeliveryShortageGoods?: number;
  };
  cardForCOD?: {
    /** номер картки */
    number: string;
    /** ПІБ отримувача */
    ownername?: string;
    /** Телефон отримувача */
    ownermobile?: string;
  };
};
export interface Parcel2PathParams {
    /** Унікальний ідентифікатор відправлення */
    parcelID: string;
}
/** Result payload */
export type Parcel2Result = {
  /** Унікальний іденифікатор відправлення */
  parcelID?: string;
  /** Штрих-код відправлення, згенерований системою */
  barCode?: string;
  /** Обчислена системою вартість послуг */
  costOfServices?: number;
  /** Прогнозована дата доставки. Не обчислюється, якщо у запиті не заповнено параметр "sendingDate" */
  estimatedDeliveryDate?: string;
};
export type Parcel2Response = MeestResponse<Parcel2Result>;
export interface Parcel2Request {
  path: Parcel2PathParams;
  body?: Parcel2RequestBody;
}

// parcels :: DELETE /parcel/{parcelID}/{contractID}
// Вилучення відправлення
export type Parcel3RequestBody = unknown;
export interface Parcel3PathParams {
    /** Унікальний ідентифікатор відправлення */
    parcelID: string;
    contractID?: string;
}
/** Result payload */
export type Parcel3Result = Record<string, unknown>;
export type Parcel3Response = MeestResponse<Parcel3Result>;
export interface Parcel3Request {
  path: Parcel3PathParams;
  body?: Parcel3RequestBody;
}

// parcels :: PUT /parcelChangeContractID
// Зміна агента
export type ParcelChangeContractIDRequestBody = {
  /** унікальний ідентифікатор договору */
  contractID: string;
  /** тип оплати */
  payType?: string;
  /** хто оплачує true - отримувач; false - відправник */
  receiverPay?: string;
};
export interface ParcelChangeContractIDQueryParams {
    barCode: string;
}
/** Result payload */
export type ParcelChangeContractIDResult = Record<string, unknown>;
export type ParcelChangeContractIDResponse = MeestResponse<ParcelChangeContractIDResult>;
export interface ParcelChangeContractIDRequest {
  query: ParcelChangeContractIDQueryParams;
  body?: ParcelChangeContractIDRequestBody;
}

// parcels :: GET /parcelsList/{dateFrom}
// Перелік створених відправлень певною датою
export interface ParcelsListPathParams {
    /** Приклад: 19.12.2023 */
    dateFrom: string;
}
/** Result payload */
export type ParcelsListResult = Array<{
    /** Унікальний ідентифікатор відправлення */
    parcelID?: string;
    /** Номер відправлення */
    parcelNumber?: string;
    /** Штрихкод відправлення */
    "вarCode"?: string;
    /** Реєстр, до якого належить відправлення */
    registerID?: string;
    /** Тип реєстру */
    registerType?: string;
  }>;
export type ParcelsListResponse = MeestResponse<ParcelsListResult>;
export interface ParcelsListRequest {
  path: ParcelsListPathParams;
}

// parcels :: GET /parcelStatus/{parcelID}
// Статуси відправлення
export interface ParcelStatusPathParams {
    /** Унікальний ідентифікатор відправлення (parcelID) або штрих-код відправлення, згенерований системою (barCode) */
    parcelID: string;
}
/** Result payload */
export type ParcelStatusResult = Array<{
    /** статус */
    status?: string;
    /** код статуса */
    statusCode?: string;
    /** дата статуса */
    date?: string;
  }>;
export type ParcelStatusResponse = MeestResponse<ParcelStatusResult>;
export interface ParcelStatusRequest {
  path: ParcelStatusPathParams;
}

// parcels :: GET /parcelStatusDetails/{parcelID}
// Статуси відправлення (детально)
export interface ParcelStatusDetailsPathParams {
    /** ідентифікатор відправлення */
    parcelID: string;
}
/** Result payload */
export type ParcelStatusDetailsResult = {
  /** Номер посилки */
  parcelNumber?: string;
  /** Код посилки */
  parcelCode?: string;
  /** Відділення відправника */
  senderBranch?: string;
  /** Номер відділення відправника */
  senderBranchNumber?: string;
  /** Відділення отримувача */
  receiverBranch?: string;
  /** Номер відділення отримувача */
  receiverBranchNumber?: string;
  /** TMO відділення відправника */
  senderBranchTMO?: string;
  /** Номер TMO відділення відправника */
  senderBranchTMONumber?: string;
  /** TMO відділення отримувача */
  receiverBranchTMO?: string;
  /** Номер TMO відділення отримувача */
  receiverBranchTMONumber?: string;
  /** Послуга відправника */
  senderService?: string;
  /** Послуга отримувача */
  receiverService?: string;
  statuses?: Array<string>;
};
export type ParcelStatusDetailsResponse = MeestResponse<ParcelStatusDetailsResult>;
export interface ParcelStatusDetailsRequest {
  path: ParcelStatusDetailsPathParams;
}

// parcels :: GET /specConditions
// Довідник додаткових послуг
/** Result payload */
export type SpecConditionsResult = Array<{
    /** Унікальний ідентифікатор додаткової послуги */
    conditionID?: string;
    conditionDescr?: {
      /** Назва додаткової послуги українською */
      descrUA?: string;
      /** Назва додаткової послуги російською */
      descrRU?: string;
      /** Назва додаткової послуги англійською */
      descrEN?: string;
    };
  }>;
export type SpecConditionsResponse = MeestResponse<SpecConditionsResult>;
export interface SpecConditionsRequest {
  // no parameters
}

// parcels :: POST /UnlockParcel
// Розблоковує доставку заблокованої посилки
export type UnlockParcelRequestBody = {
  /** UID договора з клієнтом в базі Росан/Міст Експрес */
  ClientUID?: string;
  /** Номер посилки */
  ClientsShipmentRef: string;
  /** UID посилки */
  ParcelUID?: string;
  /** Назва системи звідки надіслано запит */
  AppName?: string;
  /** Примітка */
  Notation?: string;
};
/** Result payload */
export type UnlockParcelResult = unknown;
export type UnlockParcelResponse = MeestResponse<UnlockParcelResult>;
export interface UnlockParcelRequest {
  body?: UnlockParcelRequestBody;
}

// print :: GET /print/cn23/{printValue}/{contentType}
// Митна декларація Cn23
export interface Cn23PathParams {
    /** Штрихкод (`barCode`) чи ідентифікатор (`parcelID`) посилки. Якщо значень кілька, то розділіть комою: `,` */
    printValue: string;
    /** Формат відповіді: `html` чи `pdf` */
    contentType: string;
}
/** Result payload */
export type Cn23Result = unknown;
export type Cn23Response = MeestResponse<Cn23Result>;
export interface Cn23Request {
  path: Cn23PathParams;
}

// print :: GET /print/declaration/{printValue}/{contentType}
// Декларація
export interface DeclarationPathParams {
    /** Штрихкод (`barCode`) чи ідентифікатор (`parcelID`) посилки. Якщо значень кілька, то розділіть комою: `,` */
    printValue: string;
    /** Формат відповіді: `html` чи `pdf` */
    contentType: string;
}
/** Result payload */
export type DeclarationResult = unknown;
export type DeclarationResponse = MeestResponse<DeclarationResult>;
export interface DeclarationRequest {
  path: DeclarationPathParams;
}

// print :: GET /print/register/{printValue}/{contentType}
// Реєстр
export interface RegisterPathParams {
    /** Значення `registerID`, що повертається функціями `registerPickup` чи `registerBranch` */
    printValue: string;
    /** Формат відповіді: `html` чи `pdf` */
    contentType: string;
}
/** Result payload */
export type RegisterResult = unknown;
export type RegisterResponse = MeestResponse<RegisterResult>;
export interface RegisterRequest {
  path: RegisterPathParams;
}

// print :: GET /print/sticker100/{printValue}
// Стікер 100х100
export interface Sticker100QueryParams {
    /** В цей параметр треба передавати ContractID у випадку друку стікера по `parcelNumber` або `barCode`. У випадку друку стікера по `parcelID` цей параметр не обов'язковий */
    agent?: string;
    /** (Не обов'язковий параметр) номер сторінки для друку. Якщо пусте значення - повертає всі сторінки. */
    page?: number;
}
export interface Sticker100PathParams {
    /** Номер (`parcelNumber` або `barCode`) чи ідентифікатор (`parcelID`) посилки. Якщо значень кілька, то розділіть комою: `,` */
    printValue: string;
}
/** Result payload */
export type Sticker100Result = unknown;
export type Sticker100Response = MeestResponse<Sticker100Result>;
export interface Sticker100Request {
  path: Sticker100PathParams;
  query?: Sticker100QueryParams;
}

// print :: GET /print/sticker100A4/{printValue}
// Друк стікера 100х100 на А4
export interface Sticker100A4QueryParams {
    /** Початкова позиція стікера на аркуші А4. По замовченню position=1. */
    position: string;
}
export interface Sticker100A4PathParams {
    /** Номер (`parcelNumber`) чи ідентифікатор (`parcelID`) посилки. Якщо значень кілька, то розділіть комою: `,` */
    printValue: string;
}
/** Result payload */
export type Sticker100A4Result = unknown;
export type Sticker100A4Response = MeestResponse<Sticker100A4Result>;
export interface Sticker100A4Request {
  path: Sticker100A4PathParams;
  query: Sticker100A4QueryParams;
}

// registers :: GET /availableTimeSlots
// Доступні часові слоти для посилки
export interface AvailableTimeSlotsQueryParams {
    /** Унікальний ідентифікатор вулиці. Отримується методом POST /addressSearch (Пошук адреси) */
    streetID: string;
    /** Для забору треба передавати тип 'pickup' */
    type: string;
}
/** Result payload */
export type AvailableTimeSlotsResult = {
  /** Зона доставки */
  zone?: string;
  /** Доступні часові слоти */
  availableTimeSlots?: Array<{
      /** Ідентифікатор слота */
      ID?: string;
      /** Тип слота */
      type?: string;
      /** Час початку */
      timeFrom?: string;
      /** Час закінчення */
      timeTo?: string;
      /** Доступно сьогодні */
      availableToday?: boolean;
    }>;
  /** Доступні дати */
  availableDates?: Array<{
      /** Дата доступності */
      date?: string;
      /** Чи доступна дата */
      isAvailable?: boolean;
    }>;
};
export type AvailableTimeSlotsResponse = MeestResponse<AvailableTimeSlotsResult>;
export interface AvailableTimeSlotsRequest {
  query: AvailableTimeSlotsQueryParams;
}

// registers :: POST /registerBranch
// Створення реєстру відправлень - СКЛАД
export type RegisterBranchRequestBody = {
  /** Примітка, коментар */
  notation?: string;
  /** Унікальний ідентифікатор клієнта */
  contractID?: string;
  parcelsItems?: Array<{
      /** Унікальний ідентифікатор відправлення */
      parcelID: string;
    }>;
};
/** Result payload */
export type RegisterBranchResult = {
  /** Унікальний ідентифікатор реєстру відправлень */
  registerID?: string;
  /** Номер реєстру відправлень */
  registerNumber?: string;
  Not_added_to_registry?: Array<string>;
};
export type RegisterBranchResponse = MeestResponse<RegisterBranchResult>;
export interface RegisterBranchRequest {
  body?: RegisterBranchRequestBody;
}

// registers :: PUT /registerBranch/{registerID}
// Редагування реєстру відправлень - СКЛАД
export type RegisterBranch2RequestBody = {
  /** Примітка, коментар */
  notation?: string;
  /** Унікальний ідентифікатор клієнта */
  contractID?: string;
  parcelsItems?: Array<{
      /** Унікальний ідентифікатор відправлення */
      parcelID: string;
    }>;
};
export interface RegisterBranch2PathParams {
    /** Унікальний ідентифікатор реєстру */
    registerID: string;
}
/** Result payload */
export type RegisterBranch2Result = {
  /** Унікальний ідентифікатор реєстру відправлень */
  registerID?: string;
  /** Номер реєстру відправлень */
  registerNumber?: string;
};
export type RegisterBranch2Response = MeestResponse<RegisterBranch2Result>;
export interface RegisterBranch2Request {
  path: RegisterBranch2PathParams;
  body?: RegisterBranch2RequestBody;
}

// registers :: DELETE /registerBranch/{registerID}
// Вилучення реєстру відправлень - СКЛАД
export type RegisterBranch3RequestBody = unknown;
export interface RegisterBranch3PathParams {
    /** Унікальний ідентифікатор реєстру */
    registerID: string;
}
/** Result payload */
export type RegisterBranch3Result = Record<string, unknown>;
export type RegisterBranch3Response = MeestResponse<RegisterBranch3Result>;
export interface RegisterBranch3Request {
  path: RegisterBranch3PathParams;
  body?: RegisterBranch3RequestBody;
}

// registers :: POST /registerPickup
// Формування реєстру відправлень та заявки на виклик - КУР'ЄРА
export type RegisterPickupRequestBody = {
  /** Примітка, коментар */
  notation?: string;
  /** Унікальний ідентифікатор клієнта. Присвоюється після внесення контрагента в систему */
  contractID?: string;
  /** Тип оплати. Значення: [cash - готівковий, noncash - безготівковий] */
  payType: string;
  /** Хто оплачує відправлення. Значення: [false - Відправник, true - Одержувач] */
  receiverPay?: boolean;
  expectedPickUpDate?: {
    /** Бажана дата забору. Формат: dd.MM.yyyy */
    date: string;
    /** Початок бажаного часового діапазону забору. Формат: hh:mm */
    timeFrom: string;
    /** Кінець бажаного часового діапазону забору. Формат: hh:mm */
    timeTo: string;
  };
  sender?: {
    /** Відправник */
    name: string;
    /** Телефон відправника */
    phone: string;
    /** Унікальний ідентифікатор адреси відправника. Отримується функцією «addressSearch» */
    addressID: string;
    /** Номер будинку відправника */
    building: string;
    /** Номер квартири відправника */
    flat?: string;
    /** Номер поверху відправника */
    floor?: string;
  };
  parcelsItems?: Array<{
      /** Унікальний ідентифікатор відправлення */
      parcelID: string;
    }>;
};
/** Result payload */
export type RegisterPickupResult = {
  /** Унікальний ідентифікатор реєстру */
  registerID?: string;
  /** Номер реєстру */
  registerNumber?: string;
  /** Визначена системою дата забору */
  pickUpDate?: string;
};
export type RegisterPickupResponse = MeestResponse<RegisterPickupResult>;
export interface RegisterPickupRequest {
  body?: RegisterPickupRequestBody;
}

// registers :: PUT /registerPickup/{registerID}
// Редагування реєстру відправлень та заявки на виклик - КУР'ЄРА
export type RegisterPickup2RequestBody = {
  /** Примітка, коментар */
  notation?: string;
  /** Унікальний ідентифікатор клієнта. Присвоюється після внесення контрагента в систему */
  contractID?: string;
  /** Тип оплати. Значення: [cash - готівковий, noncash - безготівковий] */
  payType: string;
  /** Хто оплачує відправлення. Значення: [false - Відправник, true - Одержувач] */
  receiverPay: boolean;
  expectedPickUpDate?: {
    /** Бажана дата забору. Формат: dd.MM.yyyy */
    date: string;
    /** Початок бажаного часового діапазону забору. Формат: hh:mm */
    timeFrom: string;
    /** Кінець бажаного часового діапазону забору. Формат: hh:mm */
    timeTo: string;
  };
  sender?: {
    /** Відправник */
    name: string;
    /** Телефон відправника */
    phone: string;
    /** Унікальний ідентифікатор адреси відправника. Отримується функцією «addressSearch» */
    addressID: string;
    /** Номер будинку відправника */
    building: string;
    /** Номер квартири відправника */
    flat?: string;
    /** Номер поверху відправника */
    floor?: string;
  };
  parcelsItems?: Array<{
      /** УнІкальний ідентифікатор відправлення */
      parcelID: string;
    }>;
};
export interface RegisterPickup2PathParams {
    /** Унікальний ідентифікатор реєстру */
    registerID: string;
}
/** Result payload */
export type RegisterPickup2Result = {
  /** Унікальний ідентифікатор реєстру */
  registerID?: string;
  /** Номер реєстру */
  registerNumber?: string;
  /** Визначена системою дата забору */
  pickUpDate?: string;
};
export type RegisterPickup2Response = MeestResponse<RegisterPickup2Result>;
export interface RegisterPickup2Request {
  path: RegisterPickup2PathParams;
  body?: RegisterPickup2RequestBody;
}

// registers :: DELETE /registerPickup/{registerID}
// Скасування виклику кур'єра
export type RegisterPickup3RequestBody = unknown;
export interface RegisterPickup3PathParams {
    /** Унікальний ідентифікатор реєстру */
    registerID: string;
}
/** Result payload */
export type RegisterPickup3Result = Record<string, unknown>;
export type RegisterPickup3Response = MeestResponse<RegisterPickup3Result>;
export interface RegisterPickup3Request {
  path: RegisterPickup3PathParams;
  body?: RegisterPickup3RequestBody;
}

// registers :: GET /registersList/{dateFrom}
// Перелік створених реєстрів певною датою
export interface RegistersListPathParams {
    dateFrom: string;
}
/** Result payload */
export type RegistersListResult = Array<{
    /** Унікальний ідентифікатор реєстру відправлень */
    registerID?: string;
    /** Тип реєстру відправлень */
    registerType?: string;
    /** Кількість відправлень у реєстрі */
    parcelQty?: number;
  }>;
export type RegistersListResponse = MeestResponse<RegistersListResult>;
export interface RegistersListRequest {
  path: RegistersListPathParams;
}

// search :: POST /addressSearch
// Пошук адреси
export type AddressSearchRequestBody = {
  filters?: {
    /** Унікальний ідентифікатор міста, результат виконання функції «citySearch» */
    cityID?: string;
    /** Стрічка або шаблон для пошуку вулиці */
    addressDescr?: string;
    /** Унікальний ідентифікатор адреси */
    addressID?: string;
  };
};
/** Result payload */
export type AddressSearchResult = Array<{
    /** Унікальний ідентифікатор адреси */
    addressID?: string;
    addressDescr?: {
      /** Адреса українською */
      descrUA?: string;
      /** Адреса російською */
      descrRU?: string;
      /** Адреса англійською */
      descrEN?: string;
      /** Назва згідно параметра локалізації */
      descrLoc?: string;
    };
    /** ГеоШирота */
    latitude?: number;
    /** ГеоДолгота */
    longitude?: number;
    /** Унікальний ідентифікатор міста */
    cityID?: string;
    /** Тип населеного пункту */
    viewCity?: string;
    cityDescr?: {
      /** Місто українською */
      descrUA?: string;
      /** Місто російською */
      descrRU?: string;
      /** Місто англійстькою */
      descrEN?: string;
      /**  */
      descrLoc?: string;
    };
    /** Параметр Локалізації */
    Localization?: string;
  }>;
export type AddressSearchResponse = MeestResponse<AddressSearchResult>;
export interface AddressSearchRequest {
  body?: AddressSearchRequestBody;
}

// search :: POST /addressSearchByCoord
// Пошук адреси за координатами
export type AddressSearchByCoordRequestBody = {
  /** широта */
  lat: number;
  /** довгота */
  lon: number;
};
/** Result payload */
export type AddressSearchByCoordResult = Array<{
    geoPoint?: {
      /** широта */
      lat?: string;
      /** довгота */
      lon?: string;
      /** відображуване ім'я */
      display_name?: string;
    };
    address?: {
      /** країна */
      country?: string;
      /** поштовий індекс */
      postcode?: string;
      /** область */
      region?: string;
      /** місто */
      city?: string;
      /** county */
      county?: string;
    };
    addressUID?: {
      /** Унікальний ідентифікатор населеного пункту (Теж саме, що і cityID) */
      UIDcity?: string;
      /** Унікальний ідентифікатор вулиці (Теж саме, що і streetID) */
      UIDstreet?: string;
    };
  }>;
export type AddressSearchByCoordResponse = MeestResponse<AddressSearchByCoordResult>;
export interface AddressSearchByCoordRequest {
  body?: AddressSearchByCoordRequestBody;
}

// search :: POST /branchSearch
// Пошук підрозділу
export type BranchSearchRequestBody = {
  filters?: {
    /** Унікальний ідентифікатор підрозділу. Отримується функцією "branchSearch" */
    branchID?: string;
    /** Номер відділення */
    branchNo?: number;
    /** Унікальний ідентифікатор типу підрозділу */
    branchTypeID?: string;
    /** Назва підрозділу, адреса */
    branchDescr?: string;
    /** Унікальний ідентифікатор населеного пункту. Отримується функцією «citySearch» */
    cityID?: string;
    /** Стрічка або шаблон для пошуку населеного пункту */
    cityDescr?: string;
    /** Унікальний ідентифікатор району. Отримується функцією «districtSearch» */
    districtID?: string;
    /** Стрічка або шаблон для пошуку району */
    districtDescr?: string;
    /** Унікальний ідентифікатор області. Отримується функцією «regionSearch» */
    regionID?: string;
    /** Стрічка або шаблон для пошуку області */
    regionDescr?: string;
    /** Пошук по підрозділам контрагента. «false» - всі підрозділи, «true» - підрозділи контрагента */
    networkDepartment?: boolean;
    /** Назва партнера. Доступний пошук за кількома значеннями одночасно використовуючи масив: ["Rozetka","Сільпо"]. */
    networkPartner?: string;
    /** Унікальний ідентифікатор контрагента. Доступний пошук за кількома значеннями одночасно використовуючи масив: ["139","162"]. */
    networkPartnerCode?: string;
    /** Уточнення адреси */
    addressMoreInformation?: string;
    /** Каса EPS */
    CheckoutEPS?: boolean;
  };
  /** отримати поле сobranding та сobrandingCode у відповіді */
  getCobranding?: boolean;
  /** номер кообрендингових відділень */
  "сobrandingCode"?: string;
  /** підрозділи з типом роботи тільки прийом посилок */
  in?: boolean;
  /** тільки тестові підрозділи */
  test?: boolean;
  /** Відображення тимчасово зачинених відділень. Значення: [true - так, false - ні] */
  includeInboundRestriction?: boolean;
  /** Виведення графіку навантаження відділення. Значення: [true - так, false - ні] */
  BranchLoadSchedule?: boolean;
};
/** Result payload */
export type BranchSearchResult = Array<{
    /** Унікальний ідентифікатор філії */
    branchID?: string;
    /** Посилання на філію */
    branchIDref?: string;
    /** Номер філії */
    branchNo?: number;
    /** Код філії */
    branchCode?: string;
    /** Номер філії */
    branchNumber?: string;
    /** Тип філії */
    branchType?: string;
    /** Філія відкрита */
    isBranchOpen?: boolean;
    /** Філія закрита */
    isBranchClosed?: boolean;
    /** Ідентифікатор типу філії */
    branchTypeID?: string;
    /** Опис типу філії */
    branchTypeDescr?: string;
    /** Тип філії APP */
    branchTypeAPP?: string;
    /** ID типу філії для клієнта */
    branchTypeIDClient?: string;
    /** Тип підрозділу клієнта */
    ClientTypeSubdivision?: string;
    /** ID підрозділу клієнта */
    ClientTypeSubdivisionID?: string;
    /** Коротка назва філії */
    ShortName?: string;
    /** Повна назва філії */
    FullName?: string;
    /** Наявність готівки */
    cash?: boolean;
    /** Наявність мережевого відділення */
    networkDepartment?: boolean;
    /** Мережевий партнер */
    networkPartner?: string;
    /** Код мережевого партнера */
    networkPartnerCode?: string;
    branchDescr?: {
      /** Опис філії українською */
      descrUA?: string;
      /** Опис філії локалізовано */
      descrLoc?: string;
      /** Опис для пошуку українською */
      descrSearchUA?: string;
      /** Опис для пошуку локалізовано */
      descrSearchLoc?: string;
    };
    /** Ідентифікатор адреси */
    addressID?: string;
    addressDescr?: {
      /** Адреса українською */
      descrUA?: string;
      /** Адреса російською */
      descrRU?: string;
      /** Адреса англійською */
      descrEN?: string;
      /** Адреса локалізована */
      descrLoc?: string;
    };
    /** Додаткова інформація про адресу */
    addressMoreInformation?: string;
    /** Ідентифікатор міста */
    cityID?: string;
    /** Тип населеного пункту */
    viewCity?: string;
    cityDescr?: {
      /** Місто українською */
      descrUA?: string;
      /** Місто російською */
      descrRU?: string;
      /** Місто англійською */
      descrEN?: string;
      /** Місто локалізоване */
      descrLoc?: string;
    };
    /** Ідентифікатор району */
    districtID?: string;
    districtDescr?: {
      /** Район українською */
      descrUA?: string;
      /** Район російською */
      descrRU?: string;
      /** Район англійською */
      descrEN?: string;
      /** Район локалізований */
      descrLoc?: string;
    };
    /** Ідентифікатор області */
    regionID?: string;
    regionDescr?: {
      /** Область українською */
      descrUA?: string;
      /** Область російською */
      descrRU?: string;
      /** Область англійською */
      descrEN?: string;
      /** Область локалізована */
      descrLoc?: string;
    };
    /** Час роботи */
    workingHours?: string;
    /** Будівля */
    building?: string;
    /** Поштовий індекс */
    zipCode?: string;
    /** Широта */
    latitude?: number;
    /** Довгота */
    longitude?: number;
    branchWorkTime?: Array<{
        /** День тижня */
        day?: string;
        /** Час початку */
        timeFrom?: string;
        /** Час закінчення */
        timeTo?: string;
        /** Час початку обідньої перерви */
        LunchBreakFrom?: string;
        /** Час закінчення обідньої перерви */
        LunchBreakTo?: string;
      }>;
    /** Телефон */
    phone?: string;
    /** Адреса */
    address?: string;
    /** Типи оплати */
    paymentTypes?: string;
    branchLimits?: {
      /** Максимальна вага для відправлення */
      weightTotalMax?: number;
      /** Максимальний об'єм для відправлення */
      volumeTotalMax?: number;
      /** Максимальна сума страховки */
      insuranceTotalMax?: number;
      /** Максимальна вага для місця */
      weightPlaceMax?: number;
      /** Максимальний об'єм для місця */
      volumePlaceMax?: number;
      /** Максимальна кількість місць */
      quantityPlacesMax?: number;
      gabaritesMax?: {
        /** Максимальна довжина */
        length?: number;
        /** Максимальна ширина */
        width?: number;
        /** Максимальна висота */
        height?: number;
        /** Максимальна вага */
        weightMax?: number;
      };
      /** Чи є ліміти по формату */
      formatLimit?: boolean;
      /** Немає можливості оплатити готівкою */
      cashPayUnavailible?: boolean;
      /** Тільки відправлення */
      sendingOnly?: boolean;
      /** Тільки отримання */
      receivingOnly?: boolean;
      /** Обов'язковий номер телефону отримувача */
      receiverCellPhoneRequired?: boolean;
      /** Немає терміналу для прийому готівки */
      terminalCash?: boolean;
    };
    /** Локалізація */
    Localization?: string;
    /** Чи доступний Checkout EPS */
    CheckoutEPS?: boolean;
    /** Чи перевантажений філіал */
    overloaded?: boolean;
    /** відображає чи може відділення бути обраним як улюблене */
    favourite?: boolean;
    /** відображає чи може відділення бути обраним як резервне */
    reserve?: boolean;
    /** Відображення тимчасово зачинених відділень. Значення: [true - так, false - ні] */
    InboundRestriction?: boolean;
    /** Перший день, з якого відділення тимчасово припиняє роботу. */
    InboundRestrictionStartDate?: string;
    /** Останній день, до якого відділення залишається тимчасово зачиненим. */
    InboundRestrictionEndDate?: string;
    /** Номер запису в масиві відповіді */
    ResponseArrayRecordNumber?: number;
    paymentMethods?: Array<{
        /** Унікальний ідентифікатор способу оплати */
        uid?: string;
        /** Назва способу оплати українською */
        nameUkr?: string;
      }>;
    customerIdentification?: Array<{
        /** Унікальний ідентифікатор для ідентифікації клієнта */
        uid?: string;
        /** Назва ідентифікації клієнта українською */
        nameUkr?: string;
      }>;
    PartnerServices?: Array<Record<string, unknown>>;
    Services?: Array<{
        /** Унікальний ідентифікатор сервісу */
        uid?: string;
        /** Назва сервісу українською */
        nameUkr?: string;
        /** Чи має відображення на карті */
        "кeflectMAP"?: boolean;
      }>;
    ScheduleLoadDepartments?: Array<{
        /** Час */
        Time_Range?: string;
        /** Кількість посилок, переданих на доставку кур'єрам */
        Received_from_couriers?: number;
        /** Кількість посилок, виданих на доставку кур'єрам */
        Picked_up_by_couriers?: number;
        /** Кількість посилок, отриманих клієнтами на відділенні */
        Received_by_clients?: number;
        /** Відсоток посилок, переданих на доставку кур'єрам */
        Percentage_Received_from_couriers?: number;
        /** Відсоток посилок, виданих на доставку кур'єрам */
        Percentage_Picked_up_by_couriers?: number;
        /** Відсоток посилок, отриманих клієнтами на відділенні */
        Percentage_Received_by_clients?: number;
      }>;
  }>;
export type BranchSearchResponse = MeestResponse<BranchSearchResult>;
export interface BranchSearchRequest {
  body?: BranchSearchRequestBody;
}

// search :: GET /branchSearchGeo/{latitude}/{longitude}/{radius}
// Пошук найближчого підрозділу за географічними координатами
export interface BranchSearchGeoPathParams {
    /** Широта */
    latitude: number;
    /** Довгота */
    longitude: number;
    radius: number;
}
/** Result payload */
export type BranchSearchGeoResult = Array<{
    /** Унікальний ідентифікатор підрозділу */
    branchID?: string;
    /** Номер відділення */
    branchNo?: number;
    /** Тип підрозділу. Можливі значення: [АПТ, МППВ, ОВ, ППВ, ТОЧКА] */
    branchType?: string;
    /** Код типу підрозділу */
    branchTypeID?: string;
    /** Опис типу підрозділу */
    "branchTypeDesсr"?: string;
    /** 1 = ОВ, 2 = МППВ, 3 = АПТ. */
    branchTypeAPP?: string;
    /** Доступність підрозділу */
    isAvailable?: boolean;
    /** Закритий підрозділ */
    isClosed?: boolean;
    /** Видалений підрозділ */
    isDeleted?: boolean;
    branchDescr?: {
      /** Назва підрозділу */
      descrUA?: string;
      /** Стрічка для пошуку за назвою підрозділу, адресою */
      descrSearchUA?: string;
    };
    /** Унікальний ідентифікатор адреси, результат виконання функції «addressSearch» */
    addressID?: string;
    addressDescr?: {
      /** Адреса українською */
      descrUA?: string;
      /** Адреса російською */
      descrRU?: string;
      /** Адреса англійською */
      descrEN?: string;
    };
    /** Додаткова інформація */
    addressMoreInformation?: string;
    /** Унікальний ідентифікатор міста, результат виконання функції «citySearch» */
    cityID?: string;
    cityDescr?: {
      /** Назва міста українською */
      descrUA?: string;
      /** Назва міста російською */
      descrRU?: string;
      /** Назва міста англійською */
      descrEN?: string;
    };
    /** Унікальний ідентифікатор області, результат виконання функції «regionSearch» */
    regionID?: string;
    regionDescr?: {
      /** Назва області українською */
      descrUA?: string;
      /** Назва області російською */
      descrRU?: string;
      /** Назва області англійською */
      descrEN?: string;
    };
    /** Унікальний ідентифікатор району, результат виконання функції «districtSearch» */
    districtID?: string;
    districtDescr?: {
      /** Назва району українською */
      descrUA?: string;
      /** Назва району російською */
      descrRU?: string;
      /** Назва району англійською */
      descrEN?: string;
    };
    /** Розклад роботи підрозділу, згрупований по днях,годинах */
    workingHours?: string;
    /** Номер будинку */
    building?: string;
    /** Поштовий індекс підрозділу */
    zipCode?: string;
    /** Координата підрозділу: широта */
    latitude?: number;
    /** Координата підрозділу: довгота */
    longitude?: number;
    /** відображає чи може відділення бути обраним як улюблене */
    favourite?: boolean;
    /** відображає чи може відділення бути обраним як резервне */
    reserve?: boolean;
    /** Координата місцезнаходження: широта */
    mylatitude?: number;
    /** Координата місцезнаходження: довгота */
    mylongitude?: number;
    /** Дистанція до підрозділу */
    distance?: number;
    /** Радіус пошуку */
    radius?: number;
    branchLimits?: {
      /** Максимальна загальна вага відправлення, кг. Якщо “0” – без обмежень. */
      weightTotalMax?: number;
      /** Максимальний загальний об'єм відправлення, м³. Якщо “0” – без обмежень. */
      volumeTotalMax?: number;
      /** Максимальна оголошена цінність відправлення */
      insuranceTotalMax?: number;
      /** Максимальна вага 1 місця, кг. Якщо “0” – без обмежень. */
      weightPlaceMax?: number;
      /** Максимальна кількість місць */
      quantityPlacesMax?: number;
      /** Максимальний термін зберігання відправлення */
      storageDays?: number;
      gabaritesMax?: {
        /** Максимальна довжина, см */
        length?: number;
        /** Максимальна ширина, см */
        width?: number;
        /** Максимальна висота, см */
        height?: number;
      };
      /** Дозволено лише формати «Пакет» та «Коробка» */
      formatLimit?: boolean;
      /** Оплата готівкою неможлива */
      cashPayUnavailible?: boolean;
      /** Лише відправлення, отримання неможливе */
      sendingOnly?: boolean;
      /** Лише отримання, відправлення неможливе */
      receivingOnly?: boolean;
      /** Обов'язкова наявність мобільного номера отримувача */
      receiverCellPhoneRequired?: boolean;
      /** Доступний термінал готівкової оплати(EasyPay, Приват і т.д.) */
      terminalCash?: boolean;
    };
  }>;
export type BranchSearchGeoResponse = MeestResponse<BranchSearchGeoResult>;
export interface BranchSearchGeoRequest {
  path: BranchSearchGeoPathParams;
}

// search :: GET /branchTypes
// Довідник типів відділень
/** Result payload */
export type BranchTypesResult = Array<{
    /** Ідентифікатор типу відділення */
    branchTypeID?: string;
    branchTypeDescr?: {
      /** Опис типу відділення українською */
      descrUA?: string;
      /** Тип */
      type?: string;
      /** Тип застосунку */
      typeAPP?: string;
    };
    branchLimits?: {
      /** Максимальна вага для відділення */
      weightTotalMax?: number;
      /** Максимальна вага для одного місця */
      weightPlaceMax?: number;
      /** Максимальний об'єм для відділення */
      volumeTotalMax?: number;
      /** Максимальна кількість місць */
      quantityPlacesMax?: number;
      /** Максимальна сума страхування */
      insuranceTotalMax?: number;
      /** Кількість днів зберігання */
      storageDays?: number;
      gabaritesMax?: {
        /** Максимальна довжина */
        length?: number;
        /** Максимальна ширина */
        width?: number;
        /** Максимальна висота */
        height?: number;
      };
    };
    /** Ідентифікатор підрозділу клієнта */
    ClientTypeSubdivisionID?: string;
    /** Тип підрозділу клієнта */
    ClientTypeSubdivision?: string;
    /** Назва міні-відділення */
    ClientTypeDepartmentNameMini?: string;
    /** Опис міні-відділення */
    ClientTypeDepartmentDescription?: string;
  }>;
export type BranchTypesResponse = MeestResponse<BranchTypesResult>;
export interface BranchTypesRequest {
  // no parameters
}

// search :: POST /citySearch
// Пошук населеного пункту
export type CitySearchRequestBody = {
  filters?: {
    /** Унікальний ідентифікатор населеного пункту */
    cityID?: string;
    /** Стрічка для пошуку міста по коду КОАТУУ */
    cityKATUU?: string;
    /** Стрічка для пошуку населеного пункту по назві */
    cityDescr?: string;
    /** Унікальний ідентифікатор району. Отримується функцією «districtSearch» */
    districtID?: string;
    /** Стрічка або шаблон для пошуку району */
    districtDescr?: string;
    /** Унікальний ідентифікатор країни. Отримується функцією «countrySearch» */
    countryID?: string;
    /** Унікальний ідентифікатор області. Отримується функцією «regionSearch» */
    regionID?: string;
    /** Стрічка або шаблон для пошуку області */
    regionDescr?: string;
    /** Чи наявна доставка|забір кур’єром в населеному пункті. Якщо true — видасть в результаті тільки ті населені пункти, в які здійснюється доставка чи забір. */
    isDeliveryInCity?: boolean;
    /** Чи є у місті активні відділення meest */
    IsBranchInCity?: boolean;
  };
  /** Увімкнення режиму довідника. Якщо передати true — буде виведено всі населені пункти в межах фільтра (область або район) без обмеження в 30 записів. */
  isDirectory?: boolean;
};
/** Result payload */
export type CitySearchResult = Array<{
    /** Унікальний ідентифікатор міста */
    cityID?: string;
    /** Вид населеного пункту */
    viewCity?: string;
    /**  */
    cityKATUU?: string;
    cityDescr?: {
      /** Назва міста українською */
      descrUA?: string;
      /** Назва міста російською */
      descrRU?: string;
      /** Назва міста англійською */
      descrEN?: string;
    };
    /** Унікальний ідентифікатор району, результат виконання функції «districtSearch» */
    districtID?: string;
    districtDescr?: {
      /** Назва району українською */
      descrUA?: string;
      /** Назва району російською */
      descrRU?: string;
      /** Назва району англійською */
      descrEN?: string;
    };
    /** Унікальний ідентифікатор області, результат виконання функції «regionSearch» */
    regionID?: string;
    regionDescr?: {
      /** Назва області українською */
      descrUA?: string;
      /** Назва області російською */
      descrRU?: string;
      /** Назва області англійською */
      descrEN?: string;
    };
    /** Унікальний ідентифікатор країни, результат виконання функції «countrySearch» */
    countryID?: string;
    /** Ознака наявності підрозділу в населеному пункті */
    isBranchInCity?: boolean;
    /** Ознака наявності доставки|забору кур'єром в населеному пункті */
    isDeliveryInCity?: boolean;
    /** Зона доставки */
    deliveryZone?: number;
    deliveryDays?: {
      /** Доставка можлива у понеділок */
      Mon?: boolean;
      /** Доставка можлива у вівторок */
      Tue?: boolean;
      /** Доставка можлива у середу */
      Wed?: boolean;
      /** Доставка можлива у четвер */
      Thu?: boolean;
      /** Доставка можлива у п'ятницю */
      Fri?: boolean;
      /** Доставка можлива у суботу */
      Sat?: boolean;
      /** Доставка можлива у неділю */
      Sun?: boolean;
    };
    /** довгота */
    latitude?: string;
    /** широта */
    longitude?: string;
    /** Локалізація */
    Localization?: string;
    /** Чи доступна адресна доставка в цьому місті */
    isAvailableDoorService?: boolean;
    cityLimitsDoorService?: {
      /** Недоступна адресна доставка */
      disabledDoorService?: boolean;
      /** Обмеження по вазі одного окремого місця для адресної доставки, кг . Якщо "0" – без обмежень. */
      weightPlaceMax?: number;
      /** Обмеження по вазі відправлення для адресної доставки, кг . Якщо "0" – без обмежень. */
      weightTotalMax?: number;
      /** Обмеження по об’єму для адресної доставки, м³. Якщо "0" – без обмежень. */
      volumeTotalMax?: number;
      /** Максимальна оголошена цінність відправлення для адресної доставки, грн. Якщо "0" – без обмежень. */
      insuranceTotalMax?: number;
      /** Максимальна кількість місць для адресної доставки. Якщо "0" – без обмежень. */
      quantityPlacesMax?: number;
      /** Максимальна довжина відправлення для адресної доставки, см. Якщо "0" – без обмежень */
      gabaritesMaxlength?: number;
      /** Максимальна ширина відправлення для адресної доставки, см. Якщо "0" – без обмежень. */
      gabaritesMaxwidth?: number;
      /** Максимальна висота відправлення для адресної доставки, см. Якщо "0" – без обмежень */
      gabaritesMaxheight?: number;
    };
  }>;
export type CitySearchResponse = MeestResponse<CitySearchResult>;
export interface CitySearchRequest {
  body?: CitySearchRequestBody;
}

// search :: POST /countrySearch
// Пошук країни
export type CountrySearchRequestBody = {
  filters?: {
    /** Унікальний ідентифікатор країни */
    countryID?: string;
    /** Стрічка або шаблон для пошуку країни */
    countryDescr?: string;
  };
};
/** Result payload */
export type CountrySearchResult = Array<{
    /** Унікальний ідентифікатор країни */
    countryID?: string;
    countryDescr?: {
      /** Назва країни українською */
      descrUA?: string;
      /** Назва країни російською */
      descrRU?: string;
      /** Назва країни англійською */
      descrEN?: string;
    };
    /** двозначний міжнародний код країни */
    alfaCode2?: string;
  }>;
export type CountrySearchResponse = MeestResponse<CountrySearchResult>;
export interface CountrySearchRequest {
  body?: CountrySearchRequestBody;
}

// search :: POST /districtSearch
// Пошук району
export type DistrictSearchRequestBody = {
  filters?: {
    /** Унікальний ідентифікатор району. Отримується функцією «districtSearch» */
    districtID?: string;
    /** Стрічка або шаблон для пошуку району */
    districtDescr?: string;
    /** Унікальний ідентифікатор області. Отримується функцією «regionSearch» */
    regionID?: string;
    /** Стрічка або шаблон для пошуку області */
    regionDescr?: string;
    /** Стрічка або шаблон для пошуку району по коду КОАТУУ */
    districtKATUU?: string;
  };
};
/** Result payload */
export type DistrictSearchResult = Array<{
    /** Унікальний ідентифікатор району */
    districtID?: string;
    /** Код району КОАТУУ */
    districtKATUU?: string;
    districtDescr?: {
      /** Опис українською */
      descrUA?: string;
      /** Опис російською */
      descrRU?: string;
      /** Опис англійською */
      descrEN?: string;
    };
    /** Унікальний ідентифікатор області. Отримується методом regionSearch */
    regionID?: string;
    regionDescr?: {
      /**  */
      descrUA?: string;
      /**  */
      descrRU?: string;
      /**  */
      descrEN?: string;
    };
  }>;
export type DistrictSearchResponse = MeestResponse<DistrictSearchResult>;
export interface DistrictSearchRequest {
  body?: DistrictSearchRequestBody;
}

// search :: GET /payTerminalSearch/{latitude}/{longitude}/{radius}
// Пошук найближчих місць оплат
export interface PayTerminalSearchPathParams {
    /** Довгота (приклад: 49.814048) */
    latitude: number;
    /** Широта (приклад: 24.0637) */
    longitude: number;
    /** Радіус в м (приклад 800) */
    radius: number;
}
/** Result payload */
export type PayTerminalSearchResult = Array<{
    /** Вид терміналу оплати */
    type?: string;
    /** Довгота */
    longitude?: string;
    /** Широта */
    latitude?: string;
    payTerminalDescr?: {
      /** Назва українською */
      descrUA?: string;
      /** Назва російською */
      descrRU?: string;
    };
    workingHours?: {
      /** Згруповані години роботи українською */
      descrUA?: string;
      /** Згруповані години роботи російською */
      descrRU?: string;
    };
    cityDescr?: {
      /** Назва міста українською */
      descrUA?: string;
      /** Назва міста російською */
      descrRU?: string;
    };
    addressDescr?: {
      /** Адрес українською */
      descrUA?: string;
      /** Адрес міста російською */
      descrRU?: string;
    };
    addressMoreInformationDescr?: {
      /** Додаткова інформація українською */
      descrUA?: string;
      /** Додаткова інформація російською */
      descrRU?: string;
    };
  }>;
export type PayTerminalSearchResponse = MeestResponse<PayTerminalSearchResult>;
export interface PayTerminalSearchRequest {
  path: PayTerminalSearchPathParams;
}

// search :: POST /regionSearch
// Пошук області
export type RegionSearchRequestBody = {
  filters?: {
    /** Унікальний ідентифікатор області */
    regionID?: string;
    /** Код регіону КОАТУУ */
    regionKATUU?: string;
    /** Стрічка або шаблон для пошуку області */
    regionDescr?: string;
    /** Унікальний ідентифікатор країни. Отримується функцією «countrySearch» */
    countryID?: string;
    /** Стрічка або шаблон для пошуку країни */
    countryDescr?: string;
  };
};
/** Result payload */
export type RegionSearchResult = Array<{
    /** Унікальний ідентифікатор області */
    regionID?: string;
    /** Код області КОАТУУ */
    regionKATUU?: string;
    regionDescr?: {
      /** Назва області українською */
      descrUA?: string;
      /** Назва області російською */
      descrRU?: string;
      /** Назва області англійською */
      descrEN?: string;
    };
    /** Унікальний ідентифікатор країни */
    countryID?: string;
    countryDescr?: {
      /** Назва країни українською */
      descrUA?: string;
      /** Назва країни російською */
      descrRU?: string;
      /** Назва країни англійською */
      descrEN?: string;
    };
  }>;
export type RegionSearchResponse = MeestResponse<RegionSearchResult>;
export interface RegionSearchRequest {
  body?: RegionSearchRequestBody;
}

// search :: GET /zipCodeSearch/{zipCode}
// Пошук населеного пункту за поштовим індексом
export interface ZipCodeSearchPathParams {
    /** Поштовий індекс. Приклад 61000 */
    zipCode: string;
}
/** Result payload */
export type ZipCodeSearchResult = Array<{
    /** Поштовий індекс */
    zipCode?: string;
    /** Унікальний ідентифікатор міста */
    cityID?: string;
    cityDescr?: {
      /** Назва міста українською */
      descrUA?: string;
      /** Назва міста російською */
      descrRU?: string;
      /** Назва міста англійською */
      descrEN?: string;
    };
    /** Унікальний ідентифікатор району */
    districtID?: string;
    districtDescr?: {
      /** Назва району українською */
      descrUA?: string;
      /** Назва району російською */
      descrRU?: string;
      /** Назва міста англійською */
      descrEN?: string;
    };
    /** Унікальний ідентифікатор області */
    regionID?: string;
    regionDescr?: {
      /** Назва області українською */
      descrUA?: string;
      /** Назва області російською */
      descrRU?: string;
      /** Назва області англійською */
      descrEN?: string;
    };
    /** Унікальний ідентифікатор країни */
    countryID?: string;
    /** Ознака наявності відділення в населеному пункті */
    isBranchInCity?: boolean;
    /** Зона доставки */
    deliveryZone?: number;
    deliveryDays?: {
      /** Доставка можлива у понеділок */
      Mon?: boolean;
      /** Доставка можлива у вівторок */
      Tue?: boolean;
      /** Доставка можлива у середу */
      Wed?: boolean;
      /** Доставка можлива у четвер */
      Thu?: boolean;
      /** Доставка можлива у п'ятницю */
      Fri?: boolean;
      /** Доставка можлива у суботу */
      Sat?: boolean;
      /** Доставка можлива у неділю */
      Sun?: boolean;
    };
  }>;
export type ZipCodeSearchResponse = MeestResponse<ZipCodeSearchResult>;
export interface ZipCodeSearchRequest {
  path: ZipCodeSearchPathParams;
}

// tracking :: GET /parcelInfoTracking/{parcelID}
// Повна інформація про відправлення
export interface ParcelInfoTrackingPathParams {
    /** Унікальний ідентифікатор посилки */
    parcelID: string;
}
/** Result payload */
export type ParcelInfoTrackingResult = Array<{
    /** Унікальний ідентифікатор посилки */
    parcelID?: string;
    /** Внутрішній ідентифікатор посилки */
    parcelIDref?: string;
    /** Номер посилки */
    parcelNumber?: string;
    /** Штрих-код посилки */
    barCode?: string;
    /** Дата передбачуваної доставки */
    PDD?: string;
    /** Час очікуваної доставки */
    JIT0?: string;
    sender?: {
      /** Ім'я відправника */
      name?: string;
      /** Телефон відправника */
      phone?: string;
      /** Місто відправника (українською) */
      cityUA?: string;
    };
    receiver?: {
      /** Ім'я отримувача */
      name?: string;
      /** Телефон отримувача */
      phone?: string;
      /** Місто отримувача (українською) */
      cityUA?: string;
    };
    DetailingParcelItems?: Array<{
        /** Формат пакування */
        formatName?: string;
        /** Вага посилки (кг) */
        weight?: number;
        /** Сума страхування */
        insurance?: number;
      }>;
  }>;
export type ParcelInfoTrackingResponse = MeestResponse<ParcelInfoTrackingResult>;
export interface ParcelInfoTrackingRequest {
  path: ParcelInfoTrackingPathParams;
}

// tracking :: GET /tracking/{trackNumber}
// Відстеження поштового відправлення
export interface TrackingPathParams {
    /** Номер (`parcelNumber`) чи штрихкод (`barCode`) відправлення */
    trackNumber: string;
}
/** Result payload */
export type TrackingResult = Array<{
    /** Номер відправлення */
    parcelNumber?: string;
    /** Штрих-код відправлення, згенерований системою */
    barCode?: string;
    /** Дата і час події */
    eventDateTime?: string;
    /** Міжнародний поштовий код події (див. табл. в описі функції) */
    eventCode?: number;
    /** event Code. UPU standard */
    eventCodeUPU?: string;
    /** Місця */
    eventPlaces?: string;
    eventCountryDescr?: {
      /** Країна, де зафіксовано подію (українською) */
      descrUA?: string;
      /** Країна, де зафіксовано подію (російською) */
      descrRU?: string;
      /** Країна, де зафіксовано подію (англійською) */
      descrEN?: string;
    };
    eventCityDescr?: {
      /** Населений пункт, де зафіксовано подію (українською) */
      descrUA?: string;
      /** Населений пункт, де зафіксовано подію (російською) */
      descrRU?: string;
      /** Населений пункт, де зафіксовано подію (англійською) */
      descrEN?: string;
    };
    eventDescr?: {
      /** Опис події українською */
      descrUA?: string;
      /** Опис події російською */
      descrRU?: string;
      /** Опис події англійською */
      descrEN?: string;
    };
    eventDetailDescr?: {
      /** Детальний опис події українською */
      descrUA?: string;
      /** Детальний опис події російською */
      descrRU?: string;
      /** Детальний опис події англійською */
      descrEN?: string;
    };
  }>;
export type TrackingResponse = MeestResponse<TrackingResult>;
export interface TrackingRequest {
  path: TrackingPathParams;
}

// tracking :: GET /trackingByDate/{searchDate}
// Події з посилками за обраний день
export interface TrackingByDatePathParams {
    /** Дата, за яку потрібно отримати події. Формат: yyyy-MM-dd */
    searchDate: string;
}
/** Result payload */
export type TrackingByDateResult = Array<{
    /** Номер відправлення */
    parcelNumber?: string;
    /** Штрих-код відправлення, згенерований системою */
    barCode?: string;
    /** Дата і час події */
    eventDateTime?: string;
    /** Міжнародний поштовий код події (див. табл. в описі функції) */
    eventCode?: number;
    /** event Code. UPU standard */
    eventCodeUPU?: string;
    eventCountryDescr?: {
      /** Країна, де зафіксовано подію (українською) */
      descrUA?: string;
      /** Країна, де зафіксовано подію (російською) */
      descrRU?: string;
      /** Країна, де зафіксовано подію (англійською) */
      descrEN?: string;
    };
    eventCityDescr?: {
      /** Населений пункт, де зафіксовано подію (українською) */
      descrUA?: string;
      /** Населений пункт, де зафіксовано подію (російською) */
      descrRU?: string;
      /** Населений пункт, де зафіксовано подію (англійською) */
      descrEN?: string;
    };
    eventDescr?: {
      /** Опис події українською */
      descrUA?: string;
      /** Опис події російською */
      descrRU?: string;
      /** Опис події англійською */
      descrEN?: string;
    };
    eventDetailDescr?: {
      /** Детальний опис події українською */
      descrUA?: string;
      /** Детальний опис події російською */
      descrRU?: string;
      /** Детальний опис події англійською */
      descrEN?: string;
    };
  }>;
export type TrackingByDateResponse = MeestResponse<TrackingByDateResult>;
export interface TrackingByDateRequest {
  path: TrackingByDatePathParams;
}

// tracking :: GET /trackingByPeriod/{dateFrom}/{dateTo}
// Трекінг по періоду до двох годин
export interface TrackingByPeriodPathParams {
    /** Початкова дата періоду. Формат: yyyy-MM- dd HH:mm:ss */
    dateFrom: string;
    /** Кінцева дата періоду. Формат: yyyy-MM- dd HH:mm:ss Пошук максимум до двох годин від dateFrom. */
    dateTo: string;
}
/** Result payload */
export type TrackingByPeriodResult = Array<{
    /** Номер відправлення */
    parcelNumber?: string;
    /** Штрих-код відправлення, згенерований системою */
    barCode?: string;
    /** Дата і час події */
    eventDateTime?: string;
    /** Міжнародний поштовий код події (див. табл. в описі функції) */
    eventCode?: number;
    /** event Code. UPU standard */
    eventCodeUPU?: string;
    eventCountryDescr?: {
      /** Країна, де зафіксовано подію (українською) */
      descrUA?: string;
      /** Країна, де зафіксовано подію (російською) */
      descrRU?: string;
      /** Країна, де зафіксовано подію (англійською) */
      descrEN?: string;
    };
    eventCityDescr?: {
      /** Населений пункт, де зафіксовано подію (українською) */
      descrUA?: string;
      /** Населений пункт, де зафіксовано подію (російською) */
      descrRU?: string;
      /** Населений пункт, де зафіксовано подію (англійською) */
      descrEN?: string;
    };
    eventDescr?: {
      /** Опис події українською */
      descrUA?: string;
      /** Опис події російською */
      descrRU?: string;
      /** Опис події англійською */
      descrEN?: string;
    };
    eventDetailDescr?: {
      /** Детальний опис події українською */
      descrUA?: string;
      /** Детальний опис події російською */
      descrRU?: string;
      /** Детальний опис події англійською */
      descrEN?: string;
    };
  }>;
export type TrackingByPeriodResponse = MeestResponse<TrackingByPeriodResult>;
export interface TrackingByPeriodRequest {
  path: TrackingByPeriodPathParams;
}

// tracking :: GET /trackingDelivered/{dateFrom}/{dateTo}/{page}
// Доручені відправлення за період
export interface TrackingDeliveredPathParams {
    /** Початкова дата періоду. Формат: yyyy-MM- dd HH:mm:ss */
    dateFrom: string;
    /** Кінцева дата періоду. Формат: dd.MM.yyyy HH:mm */
    dateTo: string;
    /** Номер сторінки. Сторінка повертає до 150 записів. */
    page: number;
}
/** Result payload */
export type TrackingDeliveredResult = Array<{
    /** Номер відправлення */
    parcelNumber?: string;
    /** Штрих-код відправлення, згенерований системою */
    barCode?: string;
    /** Дата і час події */
    eventDateTime?: string;
    eventCountryDescr?: {
      /** Країна, де зафіксовано подію (українською) */
      descrUA?: string;
      /** Країна, де зафіксовано подію (російською) */
      descrRU?: string;
      /** Країна, де зафіксовано подію (англійською) */
      descrEN?: string;
    };
    eventCityDescr?: {
      /** Населений пункт, де зафіксовано подію (українською) */
      descrUA?: string;
      /** Населений пункт, де зафіксовано подію (російською) */
      descrRU?: string;
      /** Населений пункт, де зафіксовано подію (англійською) */
      descrEN?: string;
    };
  }>;
export type TrackingDeliveredResponse = MeestResponse<TrackingDeliveredResult>;
export interface TrackingDeliveredRequest {
  path: TrackingDeliveredPathParams;
}
