"use strict";

const express = require(`express`);
const {HttpCode} = require(`../../constants`);
const {
  offerValidator,
  commentValidator,
} = require(`../middlewares/validation`);

const findOffer = require(`../middlewares/findOffer`);

const offersRouter = new express.Router();

module.exports = (apiRouter, service, commentService) => {
  apiRouter.use(`/offers`, offersRouter);

  offersRouter.get(`/`, (_, res) => {
    res.status(HttpCode.OK).json(service.getAll());
  });

  offersRouter.get(`/:offerId`, findOffer(service), (_, res) => {
    const {offer} = res.locals;
    res.status(HttpCode.OK).json(offer);
  });

  offersRouter.post(`/`, offerValidator, (req, res) => {
    res.status(HttpCode.CREATED).json(service.create(req.body));
  });

  offersRouter.put(`/:offerId`, [offerValidator, findOffer(service)], (req, res) => {
    const {offerId} = req.params;
    const {offer: oldOffer} = res.locals;

    const updatedOffer = service.update(offerId, oldOffer, req.body);
    res.status(HttpCode.OK).json(updatedOffer);
  });

  offersRouter.delete(`/:offerId`, findOffer(service), (req, res) => {
    const {offerId} = req.params;

    service.drop(offerId);
    res.status(HttpCode.NO_CONTENT).send();
  });

  offersRouter.get(`/:offerId/comments`, findOffer(service), (_, res) => {
    const {offer} = res.locals;
    const comments = commentService.getAll(offer);

    res.status(HttpCode.OK).json(comments);
  });

  offersRouter.post(`/:offerId/comments`, [commentValidator, findOffer(service)], (req, res) => {
    const {offer} = res.locals;
    res.status(HttpCode.CREATED).json(commentService.create(offer, req.body));
  });

  offersRouter.delete(`/:offerId/comments/:commentId`, findOffer(service), (req, res) => {
    const {commentId} = req.params;
    const {offer} = res.locals;

    commentService.drop(offer, commentId);
    res.status(HttpCode.NO_CONTENT).send();
  });
};
