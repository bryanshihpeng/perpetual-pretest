# Engineer Pretest Perpetual Protocol

### Submission due date

In 3 days, when you receive the pre-test exam

### Description

Please implement it in JavaScript or TypeScript. please follow these instructions to set up the environment:

1. create a private repository on GitHub and submit the code to this repository
2. invite dev@perp.fi as a collaborator
3. provide the repository URL

Design an exchange module with 2 initial arguments Rt & Ru, the reserves for TWD and USD. There is a trade feature on the module, and users can use TWD to exchange USD and vice versa.

Given user want to use x TWD to exchange USD, the module uses this formula to calculate the USD amount y:

```
(Rt + x) * (Ru + y) = Rt * Ru
```

When the reserve of TWD is 10,000 TWD and reserve of USD is 1,000 USD, if an user use 6000 TWD to exchange USD, they can get 375 USD:

```
(10,000 + 6,000) * (1,000 + y) = 10,000 * 1,000
y = -375
```

After the trade is done, the reserves in the module will be changed:

```
Rt` = 10,000 + 6,000 = 16,000
Ru` = 1,000 - 375 = 625
```

The next user will use updated reserves for trading.

**Unit test and simple GUI are required, please have a README file to explain how to use this module and test.**

**Please don’t hesitate to contact us if you have any questions about the pretest.**
