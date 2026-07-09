import blocksData from '../generated/cheat-sheet-blocks.json';
import layoutPolicyData from '../generated/cheat-sheet-layout-policy.json';
import presetsData from '../generated/cheat-sheet-presets.json';
import {
  CheatSheetCatalogFileSchema,
  CheatSheetLayoutPolicySchema,
  CheatSheetPresetsFileSchema,
} from '../../domain/cheat-sheet/schemas';

export const cheatSheetContent = {
  blocks: CheatSheetCatalogFileSchema.parse(blocksData),
  presets: CheatSheetPresetsFileSchema.parse(presetsData),
  layoutPolicy: CheatSheetLayoutPolicySchema.parse(layoutPolicyData),
};

export type CheatSheetContent = typeof cheatSheetContent;
