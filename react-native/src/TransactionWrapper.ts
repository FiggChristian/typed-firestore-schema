import type {
  GenericDocumentSchema,
  GenericFirestoreDocument,
  SchemaOfDocument,
} from "@firestore-schema/core";
import type {
  DotNestedSchemaKeysOf,
  DottedFieldNameIndex,
  GettableDocumentSchema,
  SetData,
  SettableDocumentSchema,
  UpdateData,
} from "./types";
import FirestoreWrapper from "./FirestoreWrapper";
import DocumentWrapper from "./DocumentWrapper";
import { FirebaseFirestoreTypes } from "@react-native-firebase/firestore";

/**
 * A typed wrapper class around Firestore
 * {@link FirebaseFirestoreTypes.Transaction `Transaction`} objects.
 *
 * Instances of this class are usually created automatically by calling
 * `.runTransaction()` on a {@link FirestoreWrapper `FirestoreWrapper`} object.
 *
 * @example
 * ```ts
 * firestore.runTransaction((wrappedTransaction) => { ... });
 * ```
 *
 * It includes most of the same methods as the underlying `Transaction` object
 * with the same behavior so that it can be used interchangeably. Methods that
 * would only be available in a read-write transaction are omitted since they
 * throw errors at runtime. It also includes the following additional
 * properties:
 *
 * Properties:
 * - {@link ref `ref`}
 */
class TransactionWrapper implements FirebaseFirestoreTypes.Transaction {
  /** The raw Firebase `Transaction` instance. */
  public ref: FirebaseFirestoreTypes.Transaction;

  /**
   * Creates a `TransactionWrapper` object around the specified `Transaction`
   * object.
   *
   * @param ref The `Transaction` object to wrap.
   */
  constructor(ref: FirebaseFirestoreTypes.Transaction) {
    this.ref = ref;
  }

  /**
   * Deletes the document referred to by the provided `DocumentReference`.
   *
   * @example
   * ```ts
   * const docRef = firestore.doc('users/alovelace');
   *
   * await firestore.runTransaction((transaction) => {
   *   return transaction.delete(docRef);
   * });
   * ```
   *
   * @param documentRef A reference to the document to be deleted.
   * @returns This `TransactionWrapper` instance. Used for chaining method
   * calls.
   */
  delete(
    documentRef:
      | DocumentWrapper<GenericFirestoreDocument>
      | FirebaseFirestoreTypes.DocumentReference
  ): this {
    this.ref.delete(
      documentRef instanceof DocumentWrapper ? documentRef.ref : documentRef
    );
    return this;
  }

  /**
   * Reads the document referenced by the provided `DocumentReference` /
   * `DocumentWrapper`.
   *
   * @example
   * ```ts
   * const docRef = firestore.doc('users/alovelace');
   *
   * await firestore.runTransaction(async (transaction) => {
   *   const snapshot = await transaction.get(docRef);
   *    // use snapshot with transaction (see set() or update())
   *    ...
   * });
   * ```
   *
   * @param documentRef A reference to the document to be read.
   * @returns A `DocumentSnapshot` for the read data.
   */
  get<Document extends GenericFirestoreDocument>(
    documentRef:
      | DocumentWrapper<Document>
      | FirebaseFirestoreTypes.DocumentReference<SchemaOfDocument<Document>>
  ): Promise<
    FirebaseFirestoreTypes.DocumentSnapshot<GettableDocumentSchema<Document>>
  >;
  // This overload is the same as the one above. Without it, TypeScript
  // complains that the above overload is not compatible with the base
  // `Transaction.get` method because the return type is more narrow than the
  // base `Transaction.get`'s return type. Adding this overload fixes that.
  get<Document extends GenericFirestoreDocument>(
    documentRef:
      | DocumentWrapper<Document>
      | FirebaseFirestoreTypes.DocumentReference<SchemaOfDocument<Document>>
  ): Promise<
    FirebaseFirestoreTypes.DocumentSnapshot<GettableDocumentSchema<Document>>
  >;
  get(
    documentRef:
      | DocumentWrapper<GenericFirestoreDocument>
      | FirebaseFirestoreTypes.DocumentReference<GenericDocumentSchema>
  ): Promise<FirebaseFirestoreTypes.DocumentSnapshot<GenericDocumentSchema>> {
    return this.ref.get(
      documentRef instanceof DocumentWrapper ? documentRef.ref : documentRef
    );
  }

  /**
   * Writes to the document referred to by the provided `DocumentReference` /
   * `DocumentWrapper`. If the document does not exist yet, it will be created.
   * If you pass `SetOptions`, the provided data can be merged into the existing
   * document.
   *
   * @example
   * ```ts
   * const docRef = firestore.doc('users/alovelace');
   *
   * await firestore.runTransaction((transaction) => {
   *   const snapshot = await transaction.get(docRef);
   *   const snapshotData = snapshot.data();
   *
   *   return transaction.set(docRef, {
   *     ...data,
   *     age: 30, // new field
   *   });
   * });
   * ```
   *
   * @param documentRef A reference to the document to be set.
   * @param data An object of the fields and values for the document.
   * @param options An object to configure the set behavior.
   * @returns This `TransactionWrapper` instance. Used for chaining method
   * calls.
   */
  set<Document extends GenericFirestoreDocument>(
    documentRef:
      | DocumentWrapper<Document>
      | FirebaseFirestoreTypes.DocumentReference<SchemaOfDocument<Document>>,
    data: SetData<SettableDocumentSchema<Document>>,
    options?: FirebaseFirestoreTypes.SetOptions
  ): this {
    if (options === undefined) {
      // Call overload with 2 arguments.
      this.ref.set(documentRef, data);
    } else {
      // Call overload with 3 arguments.
      this.ref.set(documentRef, data, options);
    }
    return this;
  }

  /**
   * Updates fields in the document referred to by the provided
   * `DocumentReference` / `DocumentWrapper`. The update will fail if applied to
   * a document that does not exist.
   *
   * @example
   * ```ts
   * const docRef = firestore.doc('users/alovelace');
   *
   * await firestore.runTransaction((transaction) => {
   *   const snapshot = await transaction.get(docRef);
   *
   *   return transaction.update(docRef, {
   *     age: snapshot.data().age + 1,
   *   });
   * });
   * ```
   *
   * @param documentRef A reference to the document to be updated.
   * @param data An object containing the fields and values with which to update
   * the document. Fields can contain dots to reference nested fields within the
   * document.
   * @returns This `TransactionWrapper` instance. Used for chaining method
   * calls.
   */
  update<Document extends GenericFirestoreDocument>(
    documentRef:
      | DocumentWrapper<Document>
      | FirebaseFirestoreTypes.DocumentReference<SchemaOfDocument<Document>>,
    data: UpdateData<SettableDocumentSchema<Document>>
  ): this;
  /**
   * Updates fields in the document referred to by the provided
   * `DocumentReference` / `DocumentWrapper`. The update will fail if applied to
   * a document that does not exist.
   *
   * Nested fields can be updated by providing dot-separated field path strings
   * or by providing FieldPath objects.
   *
   * @example
   * ```ts
   * const docRef = firestore.doc('users/alovelace');
   *
   * await firestore.runTransaction((transaction) => {
   *   const snapshot = await transaction.get(docRef);
   *
   *   return transaction.update(docRef, 'age', snapshot.data().age + 1);
   * });
   * ```
   *
   * @param documentRef A reference to the document to be updated.
   * @param field The first field to update.
   * @param value The first value.
   * @param moreFieldsAndValues Additional key/value pairs.
   * @returns This `TransactionWrapper` instance. Used for chaining method
   * calls.
   */
  update<
    Document extends GenericFirestoreDocument,
    K extends DotNestedSchemaKeysOf<Document>
  >(
    documentRef:
      | DocumentWrapper<Document>
      | FirebaseFirestoreTypes.DocumentReference<SchemaOfDocument<Document>>,
    field: K | FirebaseFirestoreTypes.FieldPath,
    value:
      | DottedFieldNameIndex<K, SettableDocumentSchema<Document>>
      | FirebaseFirestoreTypes.FieldValue,
    ...moreFieldsAndValues: unknown[]
  ): this;
  update(
    documentRef:
      | DocumentWrapper<GenericFirestoreDocument>
      | FirebaseFirestoreTypes.DocumentReference<GenericDocumentSchema>,
    dataOrField:
      | UpdateData<GenericDocumentSchema>
      | string
      | FirebaseFirestoreTypes.FieldPath,
    ...moreFieldsAndValues: unknown[]
  ): this {
    this.ref.update(
      documentRef instanceof DocumentWrapper ? documentRef.ref : documentRef,
      dataOrField as string,
      ...(moreFieldsAndValues as [unknown, ...unknown[]])
    );
    return this;
  }
}

export default TransactionWrapper;
