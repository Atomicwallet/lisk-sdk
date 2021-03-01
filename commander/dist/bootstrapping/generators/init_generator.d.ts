import BaseGenerator from './base_generator';
export default class InitGenerator extends BaseGenerator {
    initializing(): Promise<void>;
    configuring(): void;
    writing(): void;
    install(): void;
}
