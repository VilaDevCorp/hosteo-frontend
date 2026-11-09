import { ITEM_TYPE, ItemType } from '../types/entities';

export type BulkAction = 'update' | 'delete';

const itemLabel = (itemType: ItemType, count: number) =>
    `${itemType === ITEM_TYPE.EVENT ? 'event' : 'assignment'}${
        count === 1 ? '' : 's'
    }`;

export const getBulkResultLabel = (
    itemType: ItemType,
    action: BulkAction,
    count: number
) =>
    `${count} ${itemLabel(itemType, count)} ${
        action === 'update' ? 'updated' : 'deleted'
    }`;
