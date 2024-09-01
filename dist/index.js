"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_server_1 = require("@hono/node-server");
const hono_1 = require("hono");
const cors_1 = require("hono/cors");
const UserController_1 = __importDefault(require("./user-manage/UserController"));
const DemoController_1 = __importDefault(require("./demo/DemoController"));
const AuthController_1 = __importDefault(require("./authentication/AuthController"));
const TaxonomyController_1 = __importDefault(require("./taxonomy/TaxonomyController"));
const DishesController_1 = __importDefault(require("./dishes/DishesController"));
const FileManaga_1 = __importDefault(require("./file-manage/FileManaga"));
const CheckoutController_1 = __importDefault(require("./checkout/CheckoutController"));
const app = new hono_1.Hono();
app.use("/*", (0, cors_1.cors)({
    origin: [`${process.env.ALLOWED_ORIGIN_WEB}`, 'http://localhost:3001'],
    allowMethods: ["POST", "GET", "PUT", "DELETE"],
    credentials: true
}));
app.get('/', (c) => {
    return c.text('Hello Hono!');
});
app.route("/api/auth", AuthController_1.default);
app.route("/api/user", UserController_1.default);
app.route("/api/taxonomy", TaxonomyController_1.default);
app.route("/api/dishes", DishesController_1.default);
app.route("/api/checkout", CheckoutController_1.default);
app.route("/api/file", FileManaga_1.default);
//
app.route("/api/demo", DemoController_1.default);
const port = 8081;
console.log(`Server is running on port ${port}`);
(0, node_server_1.serve)({
    fetch: app.fetch,
    port
});
