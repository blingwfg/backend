import NotePayloadSchema from "./schema.js";
import InvariantError from "../../exception/InvariantError.js";
const NoteValidator = {

    validatorNotePayload: payload => {
        const validationResult = NotePayloadSchema.validate(payload);

        if (validationResult.error) {
            throw new InvariantError(validationResult.error.message);
        }
    }
}

export default NoteValidator