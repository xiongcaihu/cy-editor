@REM 配置： https://docs.cypress.io/guides/guides/command-line#cypress-run  --headed  --no-exit 

@REM start cmd /k npx cypress run-ct --browser chrome --headed --no-exit --spec "cypress/integration/listComp.spec.tsx"
@REM start cmd /k npx cypress run-ct --browser chrome --headed --no-exit --spec "cypress/integration/todoListComp.spec.tsx"
@REM start cmd /k npx cypress run-ct --browser chrome --headed --no-exit --spec "cypress/integration/tableComp.spec.tsx"

start cmd /k npx cypress run-ct --browser chrome --headed --spec "cypress/integration/*.spec.tsx"