---
title: ''
labels: []
body:
  - type: markdown
    attributes:
      value: |
        Thanks for starting a discussion. This space is for ideas, questions, feedback, and conversations about Northstar Recovery. There are no wrong ways to contribute here.
  - type: textarea
    id: topic
    attributes:
      label: What's on your mind?
      description: Share your thought, question, or idea. As much or as little as you like.
      placeholder: "e.g. I've been thinking about how the Calm tab could..."
    validations:
      required: true
  - type: dropdown
    id: category
    attributes:
      label: Category
      description: What kind of discussion is this?
      options:
        - General feedback
        - Recovery experience / how I use the app
        - Design or UX idea
        - Community & Connect feature
        - Technical question
        - Privacy or safety concern
        - Partnership or collaboration
        - Other
    validations:
      required: true
  - type: textarea
    id: context
    attributes:
      label: Any additional context?
      description: Screenshots, links, or anything else that helps.
      placeholder: Optional
    validations:
      required: false
