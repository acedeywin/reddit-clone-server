"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VoteResolver = void 0;
const isAuth_1 = require("../middleware/isAuth");
const type_graphql_1 = require("type-graphql");
const typeorm_1 = require("typeorm");
const Vote_1 = require("../entities/Vote");
let VoteResolver = class VoteResolver {
    async vote(postId, value, { req }) {
        const { userId } = req.session, isVote = value !== -1, realValue = isVote ? 1 : -1, vote = await Vote_1.Vote.findOne({ where: { postId, userId } });
        if (vote && vote.value !== realValue) {
            await typeorm_1.getConnection().transaction(async (tm) => {
                await tm.query(`update vote set value = $1 where "postId" = $2 and "userId" = $3`, [realValue, postId, userId]);
                await tm.query(`update post set points = points + $1 where id = $2`, [
                    1 * realValue,
                    postId,
                ]);
            });
        }
        else if (!vote) {
            await Vote_1.Vote.insert({
                userId,
                postId,
                value: realValue,
            });
            await typeorm_1.getConnection().query(`update post set points = points + $1 where id = $2`, [realValue, postId]);
        }
        return true;
    }
};
__decorate([
    type_graphql_1.UseMiddleware(isAuth_1.isAuth),
    type_graphql_1.Mutation(() => Boolean),
    __param(0, type_graphql_1.Arg("postId", () => type_graphql_1.Int)),
    __param(1, type_graphql_1.Arg("value", () => type_graphql_1.Int)),
    __param(2, type_graphql_1.Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, Object]),
    __metadata("design:returntype", Promise)
], VoteResolver.prototype, "vote", null);
VoteResolver = __decorate([
    type_graphql_1.Resolver(Vote_1.Vote)
], VoteResolver);
exports.VoteResolver = VoteResolver;
//# sourceMappingURL=vote.js.map