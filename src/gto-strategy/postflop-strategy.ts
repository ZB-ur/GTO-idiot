import type { PostflopStrategy, BoardTexture, Street, RelativePosition, SPRRange, HandCategory } from '../types';

interface PostflopInput {
  boardTexture: BoardTexture;
  street: Street;
  position: RelativePosition;
  sprRange: SPRRange;
  handCategory: HandCategory;
}

export function getPostflopStrategy(input: PostflopInput): PostflopStrategy {
  return {
    boardTexture: input.boardTexture,
    street: input.street,
    position: input.position,
    sprRange: input.sprRange,
    handCategory: input.handCategory,
    confidenceLevel: 'approximate',
    recommendation: {
      primaryAction: 'bet',
      secondaryAction: null,
      primaryFrequency: 0.7,
      betSizing: '2/3 pot',
      reasoning: `Default ${input.handCategory} strategy on ${input.boardTexture} ${input.street} board from ${input.position} position.`,
    },
  };
}
