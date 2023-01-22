/**
 * A heap which allocates instances of a resource.
 */
export declare class ResourceHeap<T> {
    private readonly factory;
    private readonly destructor;
    private readonly onAllocated?;
    private readonly onFreed?;
    readonly maxSize: number;
    private readonly autoShrinkThreshold;
    private readonly cache;
    private numAllocated;
    /**
     * Constructor.
     * @param factory A function which creates new instances of this heap's resource.
     * @param destructor A function which destroys instances of this heap's resource.
     * @param onAllocated A function which is called when an instance of this heap's resource is allocated.
     * @param onFreed A function which is called when an instance of this heap's resource is freed.
     * @param initialSize The initial size of this heap. Defaults to `0`.
     * @param maxSize The maximum size of this heap. Defaults to `Number.MAX_SAFE_INTEGER`. This heap cannot allocate
     * more resources than its maximum size.
     * @param autoShrinkThreshold The size above which this heap will attempt to automatically reduce its size when
     * resources are freed. The heap will never reduce its size below this threshold. Defaults to
     * `Number.MAX_SAFE_INTEGER`.
     */
    constructor(factory: () => T, destructor: (resource: T) => void, onAllocated?: ((resource: T) => void) | undefined, onFreed?: ((resource: T) => void) | undefined, initialSize?: number, maxSize?: number, autoShrinkThreshold?: number);
    /**
     * Allocates a resource instance from this heap. If this heap has an existing free resource available, one will be
     * returned. Otherwise, a new resource instance will be created, added to the heap, and returned.
     * @returns A resource.
     * @throws Error if this heap has reached its allocation limit.
     */
    allocate(): T;
    /**
     * Frees a resource instance allocated from this heap, allowing it to be re-used.
     * @param resource The resource to free.
     */
    free(resource: T): void;
}
//# sourceMappingURL=ResourceHeap.d.ts.map