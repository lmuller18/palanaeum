```ts
interface PreProcessedPost {
  id: string
  // top level root the posts. should only be one null root
  rootId: string | null
  // the immediate parent post of the current post. root will have null parentId
  parentId: string | null
}

interface PostProcessedPost {
  id: string
  rootId: string | null
  parentId: string | null

  reply: PostProcessedPost[]
}
```

Given an array of PreProcessedPosts and a post id, return a PostProcessedPost
that prunes levels to just the trunk of the found node, and all direct children,

ex. Root = 1 and Replies 2 and 3 are siblings, 4 is a reply to 2, and 5 and 6
are replies to 4 Searching for 4 should return:

```ts
{
  id: 1,
  replies: [
    {
      id: 2,
      replies: [
        {
          id: 4,
          replies: [
            { id: 5, replies: [] },
            { id: 6, replies: [] },
          ],
        },
      ],
    },
  ],
}
```

As you can see above, the flat array has been turned into a singular post that
shows the full conversation thread while excluding other branches (`id: 3`)

---

Given a flat array that would transform into this full tree:

```
Post 1
├── Post 2
│   ├── Post 5
│   │   └── Post 7
│   └── Post 6
├── Post 3
│   ├── Post 8
│   └── Post 9
└── Post 4
```

Searching for 3 would return:

```
Post 1
└── Post 3
    ├── Post 8
    └── Post 9
```

Searching for 2 would return:

```
Post 1
└── Post 2
    ├── Post 5
    └── Post 6
```

Searching for 1 would return:

```
Post 1
├── Post 2
├── Post 3
└── Post 4
```
