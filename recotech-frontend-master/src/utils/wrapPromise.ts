type Resource<T> = {
    read: () => T;
};

const wrapPromise = <T>(promise: Promise<T>): Resource<T> => {
    let status: 'pending' | 'success' | 'error' = 'pending';
    let result: T | undefined;
    let error: any;

    const suspender = promise
        .then((res) => {
            status = 'success';
            result = res;
        })
        .catch((err) => {
            status = 'error';
            error = err;
        });

    return {
        // @ts-expect-error
        read(): T | undefined {
            if (status === 'pending') {
                throw suspender; // Trigger Suspense
            } else if (status === 'error') {
                throw error; // Handle error
            } else if (status === 'success') {
                return result; // Return the successful result
            }
        },
    };
};

export default wrapPromise;
