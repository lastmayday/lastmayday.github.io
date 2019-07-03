---
layout: default
title: Algorithms - Union Find
---

* toc
{:toc #toc}

<br />


I used to solve many algorithm problems by using DFS / BFS, but Union-Find can solve many of these problems.

It's a useful algorithm, and it's introduced by the book [Algorithms](https://algs4.cs.princeton.edu/home/) in Chapter 1.

<br />

## Union-Find API

There are some typical problems that we can solve by Union-Find algorithm.
For example, [Union-Find tag](https://leetcode.com/tag/union-find/) of Leetcode.

Questions are like: we have a set of items, some of the items are connected, for those are connected we call them a component, and the question is how many components we have.

Thus, the Union-Find APIs are:

<img src="http://qiniu.lastmayday.com/uf-api.png" style="width:600px;" />

- The `union()` method merges two components if the two items are in different components;

- The `find()` method returns an integer component identifier for a given item;

- The `connected()` method determines whether two items are in the same component;

- The `count()` method returns the number of components.

<br />


## Union-Find Implementation


### Basic API

The codes are simple and direct:

```java
public class UF {

    // access to component id (site indexed)
    private int[] id;

    // number of components
    private int count;

    /**
     * initialize N sites with integer names (0 to N-1)
     *
     * @param N
     */
    public UF(int N) {
        count = N;
        id = new int[N];
        for (int i = 0; i < N; i++) {
            id[i] = i;
        }
    }

    /**
     * add connection between p and q
     *
     * @param p
     * @param q
     */
    public void union(int p, int q) {
        // TODO: will be introduced below
    }

    /**
     * component identifier for p (0 to N-1)
     *
     * @param p
     * @return
     */
    public int find(int p) {
        // TODO: will be introduced below
    }

    /**
     * return true if p and q are in the same component
     *
     * @param p
     * @param q
     * @return
     */
    public boolean connected(int p, int q) {
        return find(p) == find(q);
    }

    /**
     * number of components
     *
     * @return
     */
    public int count() {
        return count;
    }
}
```

<br />


### Quick-Find

One approach is to maintain the invariant that `p` and `q` are connected if and only if `id[p]` is equal to `id[q]`.

In other words, all items in a component must have the same value in `id[]`.


This method is called quick-find because `find(p)` just returns `id[p]`, which immediately implies that `connected(p, q)` reduces to just the test `id[p] == id[q]` and returns `true` if and only
if `p` and `q` are in the same component.

Here is the implementation:

```java
public void union(int p, int q) {  // Put p and q into the same component.
    int pID = find(p);
    int qID = find(q);

    // Nothing to do if p and q are already in the same component.
    if (pID == qID) return;

    // Rename p’s component to q’s name.
    for (int i = 0; i < id.length; i++) {
        if (id[i] == pID) {
            id[i] = qID;
        }
    }    
    count--;
}

public int find(int p) {
    return id[p];
}
```

The disadvantage of this implementation is that the `union()` needs to scan through the whole `id[]` array for each input pair, so it is typically not useful for large problems.

<br />

### Quick-Union

It is based on the same data structure — the site-indexed `id[]` array.


Specifically, the `id[]` entry for each item is the name of another item in the same component (possibly itself) - we refer to this connection as a link.


To implement `find()`, we start at the given item, follow its link to another site, follow that item's link to yet another item, and so forth, following links until reaching a root, an item that
has a link to itself.


Two items are in the same component if and only if this process leads them to the same root.


Here is the implementation:

```java
public void union(int p, int q) {
    int pRoot = find(p);
    int qRoot = find(q);
    if (pRoot == qRoot) {
        return;
    }
    // Give p and q the same root.
    id[pRoot] = qRoot;
    count--;
}

public int find(int p) {
    // Find component name.
    while (p != id[p]) {
        p = id[p];
    }
    return p;
}
```

There are some improvements to Quick-Union algorithm because the link from the root can be tall, which may cause `find()` expensive.


One of the improvements is path compression, and it only has one extra line of code:


```java
public int find(int p) {
    while (p != id[p]) {
        id[p] = id[id[p]]; // please notice this line
        p = id[p];
    }
    return p;
}
```

<br />

## References

- [Algorithms](https://algs4.cs.princeton.edu/home/)

- [Union-Find Algorithms](https://www.cs.princeton.edu/~rs/AlgsDS07/01UnionFind.pdf)

<br />
