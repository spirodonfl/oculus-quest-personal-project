/**
 * Data server command schemas
 * 
 * Schemas for requests and responses
 */

if (
    (
        function schemaLoad () {
            if (!STRINGS) {
                throw new Error('STRINGS not loaded');
            }
            if (!SCHEMAS) {
                throw new Error('SCHEMAS not loaded');
            }
            return true;
        }
    )()
) {
    SCHEMAS.DATA_SERVER = {
        client: {
            askForSources: {
                is: 'object',
                required: true,
                value: {
                    message: { is: 'string', required: true, value: STRINGS[0] }
                }
            }
        },
        server: {
            provideSources: {
                is: 'object',
                required: true,
                value: {
                    message: { is: 'string', required: true, value: STRINGS[1] }
                }
            }
        }
    };
}
