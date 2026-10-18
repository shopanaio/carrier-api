# Ukrposhta contracts

`ukrposhta-ecom.openapi.json` is the OpenAPI 3.0.2 snapshot of the eCom API from SwaggerHub (`Ukrpost/ukrpost-api/1.0`, sandbox server). The types in `src/contract/types` were written against the API documentation of 09.03.2026 and checked field by field against this snapshot. Update the snapshot in its own commit so the diff shows what changed at the carrier.

## Where the snapshot and the documentation disagree

The documentation wins; the client follows it. Known differences:

- **Enums.** The snapshot lacks `CARGO` (shipment and group type), `RETURN_AFTER_5_DAYS` (`onFailReceiveType`), the lifecycle statuses `IN_DEPARTMENT`, `STORAGE`, `CANCELED`, `DELETED`, and the courier status `NOT_DELIVERED`.
- **Minimal requests.** The documentation lets a shipment name its sender and recipient by `uuid` alone, a shipment update carry only the changed fields, a client update only `addresses`, and a group be created without `type`. The snapshot marks `sender`, `recipient`, `addressId`, `phoneNumber` and the group `type` required.
- **Mass operations.** `POST /clients`, `POST /shipments`, `POST /shipment-groups` and `POST /shipment-groups/{uuid}/shipments` also take and return arrays; the snapshot describes one object. `PUT /shipments` answers an array.
- **Nulls.** The documentation examples show `null` for every unset field (`"firstName": null`); the snapshot declares plain types.
- **Lists.** `GET /client-addresses`, `/client-phones` and `/client-emails` answer arrays, the snapshot says object. `GET /clients/phone` answers a list in the snapshot and one client in the documentation: the client accepts both and returns a list.
- **Empty answers.** `DELETE /shipments/{uuid}` and `DELETE /shipments/{uuid}/shipment-group` answer an empty body, not a shipment.
- **Courier.** The status history is `GET /courier-service/orders/{uuid}/statuses` in the documentation and `/status` in the snapshot; `GET /courier-service/orders/{uuid}` returns one order, the snapshot an array.
- **Missing from the snapshot.** `GET /dictionaries/tariffs[/{uuid}]`, `POST /shipments/stickers-by-barcodes`, `/shipments/management/*`, `POST /dispatch/return-order`, the `form2-service` forms.
- **Statuses.** The snapshot lists only 401, 403 and 404 for most operations; every operation can also answer 400 (`UPE01002`) and 500.
- **Tokens.** `GET /shipments/{uuid}/lifecycle`, `/transfers/...`, `/banks`, `/dictionaries/...`, `POST /domestic/delivery-price` and `/addresses` take no counterparty token.
