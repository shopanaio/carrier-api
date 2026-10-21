// code and comments in English
import type { ClientContext, HttpClient } from '@shopana/carrier-core';
import type { UkrposhtaContractConfig } from '../config';

/** Context of the credentialed API: the eCom client, the forms client (stickers, printed forms) and the config. */
export interface UkrposhtaContractContext extends ClientContext<UkrposhtaContractConfig> {
  forms: HttpClient;
}

/** Marks operations that take the counterparty `?token=`; the auth strategy adds it. */
export const WITH_TOKEN = { counterpartyToken: true } as const;

/** Marks operations without a token (`/addresses`, `/dictionaries/tariffs`, `/domestic/delivery-price`). */
export const WITHOUT_TOKEN = { counterpartyToken: false } as const;
