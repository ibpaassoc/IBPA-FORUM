export const PRICING = {
  forumTickets: {
    startingFrom: "$295",
    standard: {
      oneDay: "$395",
      twoDays: "$695",
      galaDinner: "$150",
    },
    ibpaMembers: {
      oneDay: "$295",
      twoDays: "$595",
      galaDinner: "$150",
    },
  },
  awardParticipation: {
    startingFrom: "$50+",
    ibpaMembers: {
      oneNomination: "$50",
      threeNominations: "$130",
      fiveNominations: "$200",
    },
    nonMembers: {
      oneNomination: "$70",
      threeNominations: "$190",
      fiveNominations: "$300",
    },
  },
  judgeRegistration: {
    startingFrom: "$100",
    ibpaMembers: "$100",
    standard: "$250",
  },
} as const;
