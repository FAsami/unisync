# Mobile app

The mobile app (Expo, iOS and Android) is for the day of class. Setup lives on
the web; department admins see a link to the dashboard.

## Tabs

| Tab | Who | What |
| --- | --- | --- |
| **Home ("My day")** | everyone | The class now and the one next, then the rest of today. A cancelled, moved or re-roomed class shows the change and its reason. |
| **Schedule** | everyone | Seven days at a time, with previous and next week and a jump back to today |
| **Alerts** | everyone | The inbox: every notice for you, newest first, with unread dots and "Mark all read". Opening a notice marks it read. Tapping a push opens that notice. |
| **Send** | teachers, CRs, department admins | Write a notice to an audience you're allowed to address, and see what you've sent with push and read counts |
| **Account** | everyone | Profile (CR shows as a mark), sign out, delete account |

## Changing a class

A class you're allowed to change shows a menu on Home and Schedule. That means
you teach it, you're a CR of its section, or you're the admin of its department.

- **Cancel** the class, with a reason
- **Move** it to another date and time, optionally in another room. This is refused if the section, the teacher or the room is busy then.
- **Change room**. This is refused if the room is taken.
- **Undo** the change

Every change sends a notice to the section straight away. A moved class shows
on both days: "moved away" on the old one, "moved" on the new one.

## Who can send to whom

| Sender | Audiences |
| --- | --- |
| Department admin | the department, any of its batches, any of its sections |
| Teacher | the sections they teach |
| CR | their own section |

Nobody sends to the whole university.

## Signing in and out

- Sign in with your number and the SMS code. Numbers not on a roster can request access.
- Signing out ends the session on the server and stops pushes to that phone.
- **Delete account** asks you to confirm. It signs you out everywhere and turns
  off your devices. Your roster record stays with your department.
