'use strict';

const hours = require('../utils/hours');

const trelloStatics = {
    doingListId: '558d0b9cb1dfa6f3cc1066e6'
};

function transformActionsToPersonCards (data, cardsOrder, listsOrder) {
    const doingListOrder = listsOrder.indexOf(trelloStatics.doingListId);

    const memberCardsMap = data.actions.reduce((res, action) => {
        if (action.type !== 'commentCard') {
            return res;
        }
        const match = action.data.text.match(/^plus!\s([0-9.,]+)\/([0-9.,]+)/i);
        if (!match) {
            return res;
        }
        if (listsOrder.indexOf(action.data.list.id) > doingListOrder) {
            return res;
        }

        res.push({
            date: new Date(action.date),
            cardId: action.data.card.id,
            listId: action.data.list.id,
            memberId: action.idMemberCreator,
            s: Number.parseFloat(match[1].replace(',', '.')),
            e: Number.parseFloat(match[2].replace(',', '.'))
        });

        return res;
    }, [])
        .reduce((res, action) => {
            const key = action.cardId + action.memberId;
            let value = res.get(key);
            if (!value) {
                value = action;
                value._listOrder = listsOrder.indexOf(value.listId);
                value._cardOrder = cardsOrder.indexOf(value.cardId);
                value.firstWork = null;
                res.set(key, value);
            } else {
                value.s += action.s;
                value.e += action.e;
            }

            if (!value.lastWork || action.date > value.date) {
                value.lastWork = action.date;
            }

            value.firstE = action.e;
            value.firstEstimate = action.date;

            if (action.s) {
                value.firstWork = hours.addWorkHours(action.date, -action.s);
            }

            value.r = Math.max(0, value.e - value.s);

            return res;
        }, new Map());

    const members = Array.from(memberCardsMap.values())
        .reduce((res, memberCard) => {
            let member;
            if (!res.has(memberCard.memberId)) {
                member = {
                    id: memberCard.memberId,
                    cards: []
                };
                res.set(memberCard.memberId, member);
            } else {
                member = res.get(memberCard.memberId);
            }
            member.cards.push(memberCard);
            return res;
        }, new Map());

    return Array.from(members.values())
        .map((member) => {
            let state = 0;
            let previousEnd = null;
            member.cards = member.cards.sort((a, b) => {
                if (a._listOrder === b._listOrder) {
                    if (a._cardOrder === b._cardOrder) {
                        return 0;
                    }
                    return a._cardOrder < b._cardOrder ? -1 : 1;
                }
                return a._listOrder < b._listOrder ? -1 : 1;
            }).map((card) => {
                card.offset = state;
                state += card.r;
                if (previousEnd === null) {
                    card.begin = hours.addWorkHours(card.lastWork, -card.s);
                    card.end = hours.addWorkHours(card.lastWork, card.r);
                } else if (previousEnd < (card.firstWork || card.firstEstimate)) {
                    card.begin = card.firstWork || card.firstEstimate;
                    card.end = hours.addWorkHours(card.begin, card.r);
                } else {
                    card.begin = previousEnd;
                    card.end = hours.addWorkHours(card.begin, card.r);
                }
                previousEnd = card.end;
                return card;
            });
            return member;
        });
}

function transformTrelloResponse (data) {
    const listsOrder = data.lists.map(list => list.id)
        .reverse();
    const cardsOrder = data.cards.map(card => {
        return { id: card.id, pos: card.pos };
    })
        .sort((a, b) => {
            if (a.pos === b.pos) {
                return 0;
            }
            return a.pos > b.pos ? -1 : 1;
        })
        .map(card => card.id);

    const transformedCards = transformActionsToPersonCards(data, cardsOrder, listsOrder);

    let begin = null;
    let end = null;

    transformedCards.forEach((person) => {
        person.cards.forEach((card) => {
            if (begin === null || begin > card.begin) {
                begin = card.begin;
            }
            if (end === null || end < card.end) {
                end = card.end;
            }
        });
    });

    return {
        transformedCards,
        begin,
        end
    };
}

module.exports = transformTrelloResponse;
