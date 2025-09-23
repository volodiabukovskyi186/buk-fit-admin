export interface ApiData<T> {
    status: string;
    message: string;
    body: T;
}