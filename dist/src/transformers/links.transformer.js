"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.linkTypeTransformer = exports.linkTransformer = void 0;
var user_transformer_1 = require("./user.transformer");
var linkTransformer = function (link) {
    return {
        linkId: link.linkId,
        linkType: (0, exports.linkTypeTransformer)(link.linkType),
        dateCreated: link.dateCreated,
        url: link.url,
        creator: (0, user_transformer_1.userTransformer)(link.creator)
    };
};
exports.linkTransformer = linkTransformer;
var linkTypeTransformer = function (linkType) {
    return {
        name: linkType.name,
        creator: (0, user_transformer_1.userTransformer)(linkType.creator),
        dateCreated: linkType.dateCreated,
        required: linkType.required,
        iconName: linkType.iconName
    };
};
exports.linkTypeTransformer = linkTypeTransformer;
