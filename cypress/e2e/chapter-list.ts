import faker from '@faker-js/faker'

// describe('Club chapter list test', () => {
//   afterEach(() => {
//     cy.cleanupUser()
//   })

//   it('should allow user to mark next chapter as read', () => {
//     cy.login()
//     cy.visit('/clubs/new')

//     const testClub = {
//       title: faker.lorem.words(1),
//       chapterCount: '5',
//     }

//     cy.findByRole('textbox', { name: /title/i }).type(testClub.title)
//     cy.findByLabelText('How Many Chapters?').type(testClub.chapterCount)
//     // cy.findByRole('textbox', { name: /chapters/i }).type(testClub.chapterCount)
//     cy.findByRole('button', { name: /create club/i }).click()

//     cy.get('[data-cy=next-chapter]').within(() => {
//       cy.findByText('Up Next')
//       cy.findByText('Chapter 1')
//       cy.findByText("It's a race")

//       cy.findByRole('button', { name: /complete/i }).click()
//     })

//     cy.wait(1000)

//     cy.get('[data-cy=next-chapter]').within(() => {
//       cy.findByText('Up Next')
//       cy.findByText('Chapter 2')
//       cy.findByText("It's a race")
//     })
//   })
// })
