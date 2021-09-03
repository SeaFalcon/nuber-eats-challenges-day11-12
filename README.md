# nuber-eats-challenges-day11-12
## This is a two day challenge!
###### day9 - 10의 solution이기도 함

- 이번 챌린지 과제는 Unit test입니다.
- blueprint에는 아래와 같은 세 개의 테스트 파일이 있습니다. 여기에 테스트 코드를 작성하시면 됩니다.

```
  podcasts.service.spec.ts
  jwt.service.spec.ts
  users.service.spec.ts
```
- 위 테스트 파일들에서 Stmts(statements)가 전부 100%가 나와야 합니다.
![](https://i.imgur.com/jVtOuL8.png)

- 코드샌드박스에서 test coverage 확인 방법은 아래 처럼 + 버튼을 누르면 터미널이 나오는데, npm run test:cov를 입력하시면 됩니다.
![](https://i.imgur.com/FZ1UNVO.jpg)

<details>
  <summary>
  Hint
  </summary>

  - 유닛 테스트가 무엇인지 알고 넘어갑시다. 링크 참조.
  - 유닛 테스트를 위해 어떻게 설정을 해야 하는지 강의와 문서를 잘 참고하시길 바랍니다.
  - 모듈 설정과 repository mocking하는 jest.fn(), jsonwebtoken 패키지를 전체 mocking하는 jest.mock(), 특정함수를 mocking하는 jest.spyOn 등의 사용방법을 알고 계셔야 합니다.
  - test 설정과 관련 된 before, after 함수들과 describe, it 함수에 대한 내용을 알고 계셔야 테스트 구조를 만들기가 수월합니다.
  - coverage 결과 업데이트가 잘 되지 않는다면, npx jest --clearCache 를 입력하셔서 캐쉬를 한 번 청소하는 것을 권해드립니다.
</details>